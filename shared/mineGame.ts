// Game state types for shared use between client and server
export interface CellState {
  revealed: boolean;
  hasMine: boolean;
}

export interface GameState {
  id: string;
  board: CellState[][];
  status: "active" | "won" | "lost" | "cashed_out" | "finished";
  bet: number;
  mineCount: number;
  currentMultiplier: number;
}

export interface GameHistoryRecord {
  id: string;
  userId?: string;
  bet: number;
  mineCount: number;
  payout: number;
  result: "won" | "lost" | "cashed_out";
  multiplier: number;
  timestamp: Date;
}

// Game actions
export interface StartGameRequest {
  bet: number;
  mineCount: number;
}

export interface RevealCellRequest {
  row: number;
  col: number;
}

// Response types
export interface GameResponse {
  game: GameState;
  payout?: number;
}
