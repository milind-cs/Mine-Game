import { useState, useEffect } from "react";
import Cell from "./Cell";
import { GameState } from "@shared/mineGame";
import { cn } from "@/lib/utils";

interface GameBoardProps {
  gameState: GameState;
  onCellClick: (row: number, col: number) => void;
}

const GameBoard = ({ gameState, onCellClick }: GameBoardProps) => {
  const [mineRevealAnimation, setMineRevealAnimation] = useState(false);
  const [winAnimation, setWinAnimation] = useState(false);
  
  useEffect(() => {
    // Show explosion animation when game is lost
    if (gameState.status === "lost") {
      setMineRevealAnimation(true);
    }
    
    // Show win animation when game is won
    if (gameState.status === "won") {
      setWinAnimation(true);
      
      // Reset win animation after it plays
      const timer = setTimeout(() => {
        setWinAnimation(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.status]);

  return (
    <div className="relative">
      {/* Game board */}
      <div 
        className={cn(
          "grid grid-cols-5 gap-1 sm:gap-2 w-full max-w-xs sm:max-w-md mx-auto transition-all duration-300",
          mineRevealAnimation && "shake",
          winAnimation && "winner"
        )}
      >
        {gameState.board.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              onClick={() => onCellClick(rowIndex, colIndex)}
              gameState={gameState}
            />
          ))
        )}
      </div>
      
      {/* Overlay for game end state */}
      {(gameState.status === "won" || gameState.status === "lost") && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg z-10">
          <div className="text-center">
            <h2 className={cn(
              "text-4xl font-bold mb-4",
              gameState.status === "won" ? "text-green-500" : "text-red-500"
            )}>
              {gameState.status === "won" ? "YOU WON!" : "GAME OVER!"}
            </h2>
            <p className="text-2xl">
              {gameState.status === "won" 
                ? `You revealed all gems! Payout: $${(gameState.bet * gameState.currentMultiplier).toFixed(2)}`
                : "You hit a mine!"}
            </p>
          </div>
        </div>
      )}
      
      {/* Add CSS for animations */}
      <style jsx>{`
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        .winner {
          animation: pulse 1s infinite;
        }
        
        @keyframes shake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(4px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
          40%, 60% { transform: translate3d(6px, 0, 0); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default GameBoard;
