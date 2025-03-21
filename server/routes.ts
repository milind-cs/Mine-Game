import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { v4 as uuidv4 } from "uuid";
import { 
  CellState, 
  GameState, 
  RevealCellRequest, 
  StartGameRequest 
} from "@shared/mineGame";

const GRID_SIZE = 5;

// Calculate multiplier based on revealed cells and mine count
function calculateMultiplier(revealedCount: number, mineCount: number): number {
  const totalCells = GRID_SIZE * GRID_SIZE;
  const nonMineCells = totalCells - mineCount;
  
  if (revealedCount === 0) {
    return 1.0; // Starting multiplier
  }
  
  const remainingNonMineCells = nonMineCells - revealedCount;
  const houseEdge = 0.05; // 5% house edge
  
  // Base multiplier considering the probability
  const fairMultiplier = totalCells / nonMineCells;
  
  // Progressive multiplier that grows as more cells are revealed
  const progressFactor = nonMineCells / remainingNonMineCells;
  
  // Final multiplier with house edge applied
  return fairMultiplier * progressFactor * (1 - houseEdge);
}

// Generate a game board with randomly placed mines
function generateBoard(mineCount: number): CellState[][] {
  // Create an empty board
  const board: CellState[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() => 
      Array(GRID_SIZE)
        .fill(null)
        .map(() => ({ revealed: false, hasMine: false }))
    );
  
  // Place mines randomly
  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    
    // Only place a mine if the cell doesn't already have one
    if (!board[row][col].hasMine) {
      board[row][col].hasMine = true;
      minesPlaced++;
    }
  }
  
  return board;
}

// Check if all non-mine cells are revealed (win condition)
function checkWinCondition(game: GameState): boolean {
  const totalCells = GRID_SIZE * GRID_SIZE;
  const nonMineCells = totalCells - game.mineCount;
  const revealedNonMineCells = game.board.flat().filter(cell => cell.revealed && !cell.hasMine).length;
  
  return revealedNonMineCells === nonMineCells;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Define API routes
  
  // Start a new game
  app.post("/api/game/start", (req, res) => {
    const { bet, mineCount } = req.body as StartGameRequest;
    
    // Validate inputs
    if (!bet || !mineCount || bet <= 0 || mineCount < 1 || mineCount >= GRID_SIZE * GRID_SIZE) {
      return res.status(400).json({ message: "Invalid bet or mine count" });
    }
    
    // Create new game
    const game: GameState = {
      id: uuidv4(),
      board: generateBoard(mineCount),
      status: "active",
      bet,
      mineCount,
      currentMultiplier: 1.0
    };
    
    // Store the game
    storage.setCurrentGame(game);
    
    // Update player balance
    const updatedBalance = storage.adjustBalance(-bet);
    
    res.json({
      game,
      balance: updatedBalance
    });
  });
  
  // Reveal a cell
  app.post("/api/game/reveal", (req, res) => {
    const { row, col } = req.body as RevealCellRequest;
    
    // Get current game
    const game = storage.getCurrentGame();
    if (!game || game.status !== "active") {
      return res.status(400).json({ message: "No active game found" });
    }
    
    // Validate row and column
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
      return res.status(400).json({ message: "Invalid cell coordinates" });
    }
    
    // Check if cell is already revealed
    if (game.board[row][col].revealed) {
      return res.status(400).json({ message: "Cell already revealed" });
    }
    
    // Reveal the cell
    game.board[row][col].revealed = true;
    
    // Check if mine was hit
    if (game.board[row][col].hasMine) {
      game.status = "lost";
      
      // Record the game in history
      storage.addGameToHistory({
        id: game.id,
        bet: game.bet,
        mineCount: game.mineCount,
        payout: 0,
        result: "lost",
        multiplier: game.currentMultiplier,
        timestamp: new Date()
      });
      
      res.json({
        game,
        payout: 0
      });
    } else {
      // Calculate new multiplier based on revealed non-mine cells
      const revealedNonMineCount = game.board.flat().filter(cell => cell.revealed && !cell.hasMine).length;
      game.currentMultiplier = calculateMultiplier(revealedNonMineCount, game.mineCount);
      
      // Check if all non-mine cells are revealed (win)
      if (checkWinCondition(game)) {
        game.status = "won";
        const payout = game.bet * game.currentMultiplier;
        
        // Update player balance
        storage.adjustBalance(payout);
        
        // Record the game in history
        storage.addGameToHistory({
          id: game.id,
          bet: game.bet,
          mineCount: game.mineCount,
          payout,
          result: "won",
          multiplier: game.currentMultiplier,
          timestamp: new Date()
        });
        
        res.json({
          game,
          payout
        });
      } else {
        // Game continues
        res.json({
          game,
          payout: game.bet * game.currentMultiplier // Potential payout
        });
      }
    }
    
    // Update the game in storage
    storage.setCurrentGame(game);
  });
  
  // Cash out
  app.post("/api/game/cashout", (req, res) => {
    // Get current game
    const game = storage.getCurrentGame();
    if (!game || game.status !== "active") {
      return res.status(400).json({ message: "No active game found" });
    }
    
    // Calculate payout
    const payout = game.bet * game.currentMultiplier;
    
    // Update game status
    game.status = "cashed_out";
    
    // Update player balance
    storage.adjustBalance(payout);
    
    // Record the game in history
    storage.addGameToHistory({
      id: game.id,
      bet: game.bet,
      mineCount: game.mineCount,
      payout,
      result: "cashed_out",
      multiplier: game.currentMultiplier,
      timestamp: new Date()
    });
    
    // Update the game in storage
    storage.setCurrentGame(game);
    
    res.json({
      game,
      payout
    });
  });
  
  // Get current game
  app.get("/api/game/current", (req, res) => {
    const game = storage.getCurrentGame();
    res.json({ game });
  });
  
  // Get player balance
  app.get("/api/player/balance", (req, res) => {
    const balance = storage.getBalance();
    res.json({ balance });
  });
  
  // Get game history
  app.get("/api/player/history", (req, res) => {
    const history = storage.getGameHistory();
    res.json({ history });
  });
  
  // Reset player balance (for testing)
  app.post("/api/player/reset", (req, res) => {
    const balance = storage.resetBalance();
    res.json({ balance });
  });

  const httpServer = createServer(app);

  return httpServer;
}
