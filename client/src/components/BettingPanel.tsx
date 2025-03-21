import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { cn } from "@/lib/utils";

interface BettingPanelProps {
  onStartGame: (bet: number, mineCount: number) => void;
  maxBet: number;
}

const BettingPanel = ({ onStartGame, maxBet }: BettingPanelProps) => {
  const [bet, setBet] = useState(10);
  const [mineCount, setMineCount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const minBet = 1;
  const maxMines = 24; // Maximum 24 mines in a 5x5 grid
  const minMines = 1;

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setBet(Math.min(Math.max(value, minBet), maxBet));
    } else {
      setBet(minBet);
    }
  };

  const handleMineCountChange = (value: number[]) => {
    setMineCount(value[0]);
  };

  const handleStartGame = () => {
    if (bet > maxBet) {
      alert("You don't have enough balance!");
      return;
    }
    
    if (bet < minBet) {
      alert(`Minimum bet is $${minBet}.`);
      return;
    }
    
    setIsProcessing(true);
    onStartGame(bet, mineCount);
  };

  // Calculate potential win multiplier based on mine count
  const getMaxMultiplier = () => {
    // This is a simplified version of calculating the multiplier
    // Maximum multiplier when all non-mine cells are revealed
    const nonMineCount = 25 - mineCount;
    const houseEdge = 0.05; // 5% house edge
    const maxMultiplier = (25 / nonMineCount) * (1 - houseEdge);
    return maxMultiplier.toFixed(2);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-secondary/50 mb-8">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-4">Place Your Bet</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Bet Amount: ${bet.toFixed(2)}
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={bet}
                onChange={handleBetChange}
                min={minBet}
                max={maxBet}
                step={1}
                className="w-full"
              />
              <Button 
                variant="outline" 
                onClick={() => setBet(Math.min(bet * 2, maxBet))}
                className="whitespace-nowrap"
              >
                2x
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setBet(Math.max(bet / 2, minBet))}
                className="whitespace-nowrap"
              >
                ½x
              </Button>
            </div>
            <div className="flex justify-between mt-2">
              <Button variant="ghost" size="sm" onClick={() => setBet(minBet)}>Min</Button>
              <Button variant="ghost" size="sm" onClick={() => setBet(maxBet)}>Max</Button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Number of Mines: {mineCount}
            </label>
            <Slider
              value={[mineCount]}
              min={minMines}
              max={maxMines}
              step={1}
              onValueChange={handleMineCountChange}
              className="my-4"
            />
            <div className="flex justify-between">
              <span>1</span>
              <span>24</span>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-6">
            {[1, 3, 5, 10, 15].map((num) => (
              <Button
                key={num}
                variant={mineCount === num ? "default" : "outline"}
                onClick={() => setMineCount(num)}
                className="p-1 h-auto"
              >
                {num}
              </Button>
            ))}
          </div>
          
          <div className="p-4 rounded-md bg-background/50 mb-6">
            <div className="flex justify-between mb-2">
              <span>Potential Max Win:</span>
              <span className="font-bold text-green-500">
                ${(bet * parseFloat(getMaxMultiplier())).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Max Multiplier:</span>
              <span className="font-bold text-yellow-500">{getMaxMultiplier()}x</span>
            </div>
          </div>
          
          <Button 
            className={cn("w-full", isProcessing && "opacity-70")}
            disabled={isProcessing || bet > maxBet || bet < minBet}
            onClick={handleStartGame}
          >
            {isProcessing ? "Starting Game..." : "Start Game"}
          </Button>
        </CardContent>
      </Card>
      
      <div className="text-center opacity-70 text-sm">
        <p>Click on cells to reveal gems. Avoid mines!</p>
        <p>The more gems you reveal, the higher your multiplier.</p>
        <p>Cash out anytime before hitting a mine to secure your winnings.</p>
      </div>
    </div>
  );
};

export default BettingPanel;
