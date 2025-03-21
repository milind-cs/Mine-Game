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
  const { isMuted, toggleMute } = useAudio();
  const { balance, updateBalance, addGameToHistory } = usePlayerStore();
  
  // Initialize player with starting balance if not already done
  useEffect(() => {
    if (balance === 0) {
      updateBalance(1000); // Start with $1000 fake money
    }
    
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
      setGameState(data.game);
      
      // Handle game outcomes
      if (data.game.status === "lost") {
        useAudio.getState().playHit();
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
      useAudio.getState().playSuccess();
      
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mine Game</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {isMuted ? (
              <i className="fas fa-volume-mute text-xl"></i>
            ) : (
              <i className="fas fa-volume-up text-xl"></i>
            )}
          </button>
          <div className="text-2xl font-bold">
            Balance: ${balance.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Game Board</span>
                {gameState && gameState.status === "active" && (
                  <span className="text-primary text-xl">
                    Multiplier: {gameState.currentMultiplier.toFixed(2)}x
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
          <div className="grid grid-cols-1 gap-6">
            <GameStats gameState={gameState} />
            <GameHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MineGame;
