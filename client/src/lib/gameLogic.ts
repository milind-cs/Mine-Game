import { GRID_SIZE } from "./constants";
import { CellState, GameState } from "@shared/mineGame";

// Generate a new game board with mines randomly placed
export const generateBoard = (mineCount: number): CellState[][] => {
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
};

// Calculate the current multiplier based on revealed cells
export const calculateCurrentMultiplier = (gameState: GameState): number => {
  // Get count of revealed non-mine cells
  const revealedCount = gameState.board.flat().filter(cell => cell.revealed && !cell.hasMine).length;
  
  // Calculate multiplier based on revealed count and mine count
  const totalCells = GRID_SIZE * GRID_SIZE;
  const nonMineCells = totalCells - gameState.mineCount;
  
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
};

// Check if all non-mine cells are revealed (win condition)
export const checkWinCondition = (gameState: GameState): boolean => {
  const totalCells = GRID_SIZE * GRID_SIZE;
  const nonMineCells = totalCells - gameState.mineCount;
  const revealedNonMineCells = gameState.board.flat().filter(cell => cell.revealed && !cell.hasMine).length;
  
  return revealedNonMineCells === nonMineCells;
};

// Calculate potential payout based on current state
export const calculatePayout = (gameState: GameState): number => {
  return gameState.bet * gameState.currentMultiplier;
};
