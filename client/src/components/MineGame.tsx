import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import GameBoard from "./GameBoard";
import BettingPanel from "./BettingPanel";
import GameControls from "./GameControls";
import GameStats from "./GameStats";
import GameHistory from "./GameHistory";
import { useAudio } from "@/lib/stores/useAudio";
import { usePlayerStore } from "@/lib/stores/usePlayerStore";
import { apiRequest } from "@/lib/queryClient";
import { GameState } from "@shared/mineGame";

const MineGame = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { balance, updateBalance, addGameToHistory } = usePlayerStore();
  
  // Initialize player with starting balance and load sounds
  useEffect(() => {
    if (balance === 0) {
      updateBalance(1000); // Start with $1000 fake money
    }
    
    // Load sounds
    const loadSounds = () => {
      try {
        const hitSound = new Audio("/sounds/explosion.mp3");
        const successSound = new Audio("/sounds/success.mp3");
        const gemSound = new Audio("/sounds/gem.mp3");
        const cashoutSound = new Audio("/sounds/cashout.mp3");
        
        // Set the sounds in the audio store only after they've loaded
        hitSound.addEventListener('canplaythrough', () => useAudio.getState().setHitSound(hitSound));
        successSound.addEventListener('canplaythrough', () => useAudio.getState().setSuccessSound(successSound));
        gemSound.addEventListener('canplaythrough', () => useAudio.getState().setGemSound(gemSound));
        cashoutSound.addEventListener('canplaythrough', () => useAudio.getState().setCashoutSound(cashoutSound));
        
        // Start loading the sounds
        hitSound.load();
        successSound.load();
        gemSound.load();
        cashoutSound.load();
        
        console.log("Sound files loading started");
      } catch (error) {
        console.error("Error loading sound files:", error);
      }
    };
    
    loadSounds();
    
    // Check for ongoing game on mount
    const fetchCurrentGame = async () => {
      try {
        const response = await apiRequest("GET", "/api/game/current");
        const data = await response.json();
        if (data.game) {
          setGameState(data.game);
        }
      } catch (error) {
        console.error("Failed to fetch current game:", error);
      }
    };
    
    fetchCurrentGame();
  }, [balance, updateBalance]);

  const startGame = async (bet: number, mineCount: number) => {
    try {
      const response = await apiRequest("POST", "/api/game/start", { bet, mineCount });
      const data = await response.json();
      setGameState(data.game);
      updateBalance(-bet); // Deduct bet amount
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  const revealCell = async (row: number, col: number) => {
    if (!gameState || gameState.status !== "active") return;
    
    try {
      const response = await apiRequest("POST", "/api/game/reveal", { row, col });
      const data = await response.json();
      
      // Check if the cell had a mine
      const previousBoard = gameState.board;
      const currentBoard = data.game.board;
      const cellRevealed = 
        previousBoard[row][col].revealed !== currentBoard[row][col].revealed;
      const isMine = currentBoard[row][col].hasMine;
      
      setGameState(data.game);
      
      // Play appropriate sound based on what was revealed
      if (cellRevealed) {
        if (isMine) {
          useAudio.getState().playHit();
        } else {
          useAudio.getState().playGem();
        }
      }
      
      // Handle game outcomes
      if (data.game.status === "lost") {
        // Game already over, balance already updated on server
      } else if (data.game.status === "won") {
        useAudio.getState().playSuccess();
        updateBalance(data.payout);
        addGameToHistory({ 
          id: data.game.id,
          bet: data.game.bet,
          mineCount: data.game.mineCount,
          status: "won",
          payout: data.payout,
          multiplier: data.game.currentMultiplier,
          date: new Date()
        });
      }
    } catch (error) {
      console.error("Failed to reveal cell:", error);
    }
  };

  const cashOut = async () => {
    if (!gameState || gameState.status !== "active") return;
    
    try {
      const response = await apiRequest("POST", "/api/game/cashout");
      const data = await response.json();
      setGameState(data.game);
      updateBalance(data.payout);
      
      // Play cashout sound instead of success sound for cash out
      useAudio.getState().playCashout();
      
      addGameToHistory({ 
        id: data.game.id,
        bet: data.game.bet,
        mineCount: data.game.mineCount,
        status: "cashed_out",
        payout: data.payout,
        multiplier: data.game.currentMultiplier,
        date: new Date()
      });
    } catch (error) {
      console.error("Failed to cash out:", error);
    }
  };

  return (
    <div className="container mx-auto py-3 sm:py-4 px-2 sm:px-4 pb-16 sm:pb-24 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2 sm:gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Mine Game</h1>
        <div className="text-lg sm:text-2xl font-bold">
          Balance: ${balance.toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="py-2 sm:py-3 px-3 sm:px-6">
              <CardTitle className="flex justify-between items-center flex-wrap gap-2 text-base sm:text-lg">
                <span>Game Board</span>
                {gameState && gameState.status === "active" && (
                  <span className="text-primary text-lg sm:text-xl">
                    Multiplier: {gameState.currentMultiplier.toFixed(2)}x
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {!gameState || gameState.status === "finished" ? (
                <BettingPanel onStartGame={startGame} maxBet={balance} />
              ) : (
                <>
                  <GameBoard 
                    gameState={gameState} 
                    onCellClick={revealCell} 
                  />
                  <GameControls 
                    gameState={gameState}
                    onCashOut={cashOut}
                    onNewGame={() => setGameState(null)}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="grid grid-cols-1 gap-4">
            <GameStats gameState={gameState} />
            <GameHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MineGame;
