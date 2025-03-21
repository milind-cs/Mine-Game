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
            <p className="text-lg">Continue revealing gems or cash out now!</p>
          </div>
        );
      case "won":
        return (
          <div className="text-green-500">
            <p className="text-lg">You revealed all gems!</p>
            <p className="text-xl font-bold">
              Payout: ${(gameState.bet * gameState.currentMultiplier).toFixed(2)}
            </p>
          </div>
        );
      case "lost":
        return (
          <div className="text-red-500">
            <p className="text-lg">You hit a mine! Better luck next time.</p>
          </div>
        );
      case "cashed_out":
        return (
          <div className="text-green-500">
            <p className="text-lg">You cashed out successfully!</p>
            <p className="text-xl font-bold">
              Payout: ${currentPayout.toFixed(2)}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-sm opacity-70">Current Bet</div>
          <div className="text-lg font-bold">${gameState.bet.toFixed(2)}</div>
        </div>
        
        <div>
          <div className="text-sm opacity-70">Current Payout</div>
          <div className={cn(
            "text-lg font-bold",
            isActive ? "text-green-500" : (isGameOver && gameState.status !== "lost") ? "text-green-500" : ""
          )}>
            ${currentPayout.toFixed(2)}
          </div>
        </div>
        
        <div>
          <div className="text-sm opacity-70">Multiplier</div>
          <div className={cn(
            "text-lg font-bold",
            isActive ? "text-yellow-500" : ""
          )}>
            {gameState.currentMultiplier.toFixed(2)}x
          </div>
        </div>
      </div>
      
      <div className="text-center mb-4">
        {renderGameStatus()}
      </div>
      
      <div className="flex gap-4">
        {isActive && (
          <Button 
            onClick={handleCashOut}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Cash Out ${currentPayout.toFixed(2)}
          </Button>
        )}
        
        {isGameOver && (
          <Button 
            onClick={onNewGame}
            className="w-full"
          >
            New Game
          </Button>
        )}
      </div>
    </div>
  );
};

export default GameControls;
