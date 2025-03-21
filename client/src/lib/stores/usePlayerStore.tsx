import { create } from "zustand";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

export interface GameHistoryItem {
  id: string;
  bet: number;
  mineCount: number;
  status: string;
  payout: number;
  multiplier: number;
  date: Date;
}

interface PlayerState {
  balance: number;
  gameHistory: GameHistoryItem[];
  
  // Actions
  updateBalance: (amount: number) => void;
  setBalance: (balance: number) => void;
  addGameToHistory: (game: GameHistoryItem) => void;
  clearHistory: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => {
  // Get saved state from localStorage if available
  const savedBalance = getLocalStorage("playerBalance") || 1000;
  const savedHistory = getLocalStorage("gameHistory") || [];
  
  // Parse dates from saved history
  const parsedHistory = savedHistory.map((game: any) => ({
    ...game,
    date: new Date(game.date)
  }));
  
  return {
    balance: savedBalance,
    gameHistory: parsedHistory,
    
    updateBalance: (amount) => set((state) => {
      const newBalance = state.balance + amount;
      setLocalStorage("playerBalance", newBalance);
      return { balance: newBalance };
    }),
    
    setBalance: (balance) => set(() => {
      setLocalStorage("playerBalance", balance);
      return { balance };
    }),
    
    addGameToHistory: (game) => set((state) => {
      const newHistory = [game, ...state.gameHistory].slice(0, 20); // Keep only last 20 games
      setLocalStorage("gameHistory", newHistory);
      return { gameHistory: newHistory };
    }),
    
    clearHistory: () => set(() => {
      setLocalStorage("gameHistory", []);
      return { gameHistory: [] };
    })
  };
});
