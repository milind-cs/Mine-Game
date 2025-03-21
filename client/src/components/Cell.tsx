import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GameState, CellState } from "@shared/mineGame";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface CellProps {
  cell: CellState;
  onClick: () => void;
  gameState: GameState;
}

const Cell = ({ cell, onClick, gameState }: CellProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [popAnimation, setPopAnimation] = useState(false);
  
  // Add animation when a cell is revealed
  useEffect(() => {
    if (cell.revealed) {
      setPopAnimation(true);
      const timer = setTimeout(() => {
        setPopAnimation(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [cell.revealed]);

  // Determine cell content based on state
  const getCellContent = () => {
    if (cell.revealed) {
      if (cell.hasMine) {
        return <i className="fas fa-bomb text-xl"></i>;
      } else {
        return <i className="fas fa-gem text-xl text-blue-400"></i>;
      }
    } else if ((gameState.status === "lost" || gameState.status === "cashed_out") && cell.hasMine) {
      // Show mines when game is over
      return <i className="fas fa-bomb text-xl text-red-500 opacity-70"></i>;
    } else {
      return null;
    }
  };

  // Determine cell styling
  const cellStyle = cn(
    "w-16 h-16 flex items-center justify-center rounded-md cursor-pointer transition-all duration-200",
    popAnimation && "pop",
    cell.revealed 
      ? cell.hasMine 
        ? "bg-red-600 text-white" 
        : "bg-primary text-primary-foreground" 
      : "bg-secondary hover:bg-secondary/80",
    gameState.status !== "active" && !cell.revealed && "cursor-not-allowed opacity-80",
    isHovered && gameState.status === "active" && !cell.revealed && "ring-2 ring-primary",
  );

  const handleClick = () => {
    if (gameState.status === "active" && !cell.revealed) {
      onClick();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cellStyle}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {getCellContent()}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {cell.revealed
            ? cell.hasMine
              ? "Mine! Game Over"
              : "Gem Found!"
            : gameState.status === "active"
              ? "Click to reveal"
              : "Game ended"}
        </TooltipContent>
      </Tooltip>
      
      <style jsx>{`
        .pop {
          animation: pop 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        
        @keyframes pop {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </TooltipProvider>
  );
};

export default Cell;
