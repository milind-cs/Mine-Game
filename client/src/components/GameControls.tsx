import { Button } from "./ui/button";
import { GameState } from "@shared/mineGame";
import { cn } from "@/lib/utils";

interface GameControlsProps {
  gameState: GameState;
  onCashOut: () => void;
  onNewGame: () => void;
}

const GameControls = ({ gameState, onCashOut, onNewGame }: GameControlsProps) => {
  const isActive = gameState.status === "active";
  const isGameOver = gameState.status === "lost" || gameState.status === "won" || gameState.status === "cashed_out";
  
  // Calculate current payout
  const currentPayout = isActive
    ? gameState.bet * gameState.currentMultiplier
    : gameState.status === "cashed_out"
      ? gameState.bet * gameState.currentMultiplier
      : 0;

  const handleCashOut = () => {
    if (isActive) {
      onCashOut();
    }
  };

  const renderGameStatus = () => {
    switch (gameState.status) {
      case "active":
        return (
          <div className="text-primary">
            <p className="text-sm sm:text-lg">Continue revealing gems or cash out now!</p>
          </div>
        );
      case "won":
        return (
          <div className="text-green-500">
            <p className="text-sm sm:text-lg">You revealed all gems!</p>
            <p className="text-base sm:text-xl font-bold">
              Payout: ${(gameState.bet * gameState.currentMultiplier).toFixed(2)}
            </p>
          </div>
        );
      case "lost":
        return (
          <div className="text-red-500">
            <p className="text-sm sm:text-lg">You hit a mine! Better luck next time.</p>
          </div>
        );
      case "cashed_out":
        return (
          <div className="text-green-500">
            <p className="text-sm sm:text-lg">You cashed out successfully!</p>
            <p className="text-base sm:text-xl font-bold">
              Payout: ${currentPayout.toFixed(2)}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-4 sm:mt-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4 text-center sm:text-left">
        <div>
          <div className="text-xs sm:text-sm opacity-70">Current Bet</div>
          <div className="text-sm sm:text-lg font-bold">${gameState.bet.toFixed(2)}</div>
        </div>
        
        <div>
          <div className="text-xs sm:text-sm opacity-70">Current Payout</div>
          <div className={cn(
            "text-sm sm:text-lg font-bold",
            isActive ? "text-green-500" : (isGameOver && gameState.status !== "lost") ? "text-green-500" : ""
          )}>
            ${currentPayout.toFixed(2)}
          </div>
        </div>
        
        <div>
          <div className="text-xs sm:text-sm opacity-70">Multiplier</div>
          <div className={cn(
            "text-sm sm:text-lg font-bold",
            isActive ? "text-yellow-500" : ""
          )}>
            {gameState.currentMultiplier.toFixed(2)}x
          </div>
        </div>
      </div>
      
      <div className="text-center mb-3 sm:mb-4 min-h-[60px] flex items-center justify-center">
        {renderGameStatus()}
      </div>
      
      <div className="flex gap-2 sm:gap-4">
        {isActive && (
          <Button 
            onClick={handleCashOut}
            className="w-full bg-green-600 hover:bg-green-700 py-2 text-sm sm:text-base"
          >
            Cash Out ${currentPayout.toFixed(2)}
          </Button>
        )}
        
        {isGameOver && (
          <Button 
            onClick={onNewGame}
            className="w-full py-2 text-sm sm:text-base"
          >
            New Game
          </Button>
        )}
      </div>
    </div>
  );
};

export default GameControls;
