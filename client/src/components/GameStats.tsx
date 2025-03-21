import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { GameState } from "@shared/mineGame";

interface GameStatsProps {
  gameState: GameState | null;
}

const GameStats = ({ gameState }: GameStatsProps) => {
  if (!gameState) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Start a game to see stats
          </p>
        </CardContent>
      </Card>
    );
  }

  // Count revealed cells
  const revealedCount = gameState.board.flat().filter(cell => cell.revealed).length;
  const totalCells = 25;
  const totalMines = gameState.mineCount;
  const remainingGems = totalCells - totalMines - revealedCount;
  
  // Calculate progress percentage
  const safeRevealedPercentage = 
    Math.round((revealedCount / (totalCells - totalMines)) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/50 p-3 rounded-md">
            <div className="text-sm text-muted-foreground">Bet Amount</div>
            <div className="text-lg font-semibold">${gameState.bet.toFixed(2)}</div>
          </div>
          
          <div className="bg-secondary/50 p-3 rounded-md">
            <div className="text-sm text-muted-foreground">Mines</div>
            <div className="text-lg font-semibold">{gameState.mineCount}</div>
          </div>
          
          <div className="bg-secondary/50 p-3 rounded-md">
            <div className="text-sm text-muted-foreground">Revealed</div>
            <div className="text-lg font-semibold">{revealedCount} / {totalCells - totalMines}</div>
          </div>
          
          <div className="bg-secondary/50 p-3 rounded-md">
            <div className="text-sm text-muted-foreground">Remaining Gems</div>
            <div className="text-lg font-semibold">{remainingGems}</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm">{safeRevealedPercentage}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${safeRevealedPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="text-sm text-muted-foreground mb-2">Potential Payout</div>
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold text-green-500">
              ${(gameState.bet * gameState.currentMultiplier).toFixed(2)}
            </div>
            <div className="text-yellow-500 font-bold">
              {gameState.currentMultiplier.toFixed(2)}x
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameStats;
