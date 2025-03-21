// Game constants
export const GRID_SIZE = 5;
export const MIN_MINES = 1;
export const MAX_MINES = 24;
export const MIN_BET = 1;

// Multiplier calculation
export const calculateMultiplier = (
  totalCells: number,
  totalMines: number,
  revealedCells: number
): number => {
  // This calculation ensures the multiplier grows as more cells are revealed
  // and accounts for the risk associated with the number of mines
  const nonMineCells = totalCells - totalMines;
  const remainingNonMineCells = nonMineCells - revealedCells;
  const houseEdge = 0.05; // 5% house edge
  
  // Base multiplier considering the probability of selecting non-mine cells
  const fairMultiplier = totalCells / nonMineCells; 
  
  // Adjust for house edge
  const adjustedMultiplier = fairMultiplier * (1 - houseEdge);
  
  // Progressive multiplier that grows as more cells are revealed
  if (revealedCells === 0) {
    return 1.0; // Starting multiplier
  }
  
  // Multiplier grows faster as player reveals more cells
  // The fewer remaining non-mine cells, the higher the risk and reward
  const progressFactor = nonMineCells / remainingNonMineCells;
  return adjustedMultiplier * progressFactor;
};

// Maximum potential multiplier
export const getMaxMultiplier = (totalCells: number, totalMines: number): number => {
  const nonMineCells = totalCells - totalMines;
  const houseEdge = 0.05;
  return (totalCells / nonMineCells) * (1 - houseEdge);
};
