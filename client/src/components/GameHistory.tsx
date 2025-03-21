import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { usePlayerStore } from "@/lib/stores/usePlayerStore";
import { cn } from "@/lib/utils";

const GameHistory = () => {
  const { gameHistory } = usePlayerStore();
  const [isVisible, setIsVisible] = useState(true);
  
  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Get status icon based on game result
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "won":
        return <i className="fas fa-trophy text-yellow-500"></i>;
      case "lost":
        return <i className="fas fa-bomb text-red-500"></i>;
      case "cashed_out":
        return <i className="fas fa-check-circle text-green-500"></i>;
      default:
        return null;
    }
  };

  // Get status text color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "text-yellow-500";
      case "lost":
        return "text-red-500";
      case "cashed_out":
        return "text-green-500";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Game History</CardTitle>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-muted-foreground hover:text-foreground"
        >
          {isVisible ? (
            <i className="fas fa-chevron-up"></i>
          ) : (
            <i className="fas fa-chevron-down"></i>
          )}
        </button>
      </CardHeader>
      <CardContent className={cn(!isVisible && "hidden")}>
        {gameHistory.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No games played yet
          </p>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="text-left pb-2">Time</th>
                  <th className="text-right pb-2">Bet</th>
                  <th className="text-right pb-2">Mines</th>
                  <th className="text-right pb-2">Payout</th>
                  <th className="text-right pb-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {gameHistory.map((game) => (
                  <tr key={game.id} className="border-t border-border">
                    <td className="py-2 text-xs">{formatDate(game.date)}</td>
                    <td className="py-2 text-xs text-right">${game.bet.toFixed(2)}</td>
                    <td className="py-2 text-xs text-right">{game.mineCount}</td>
                    <td className="py-2 text-xs text-right">
                      ${game.payout.toFixed(2)}
                      <span className="text-xs opacity-60 ml-1">
                        ({game.multiplier.toFixed(2)}x)
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <span className={cn("flex items-center justify-end gap-1", getStatusColor(game.status))}>
                        {getStatusIcon(game.status)}
                        <span className="text-xs capitalize">
                          {game.status === "cashed_out" ? "Cashed Out" : game.status}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameHistory;
