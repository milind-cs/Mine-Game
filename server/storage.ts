import { users, type User, type InsertUser } from "@shared/schema";
import { GameHistoryRecord, GameState } from "@shared/mineGame";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game operations
  getCurrentGame(): GameState | null;
  setCurrentGame(game: GameState): void;
  getBalance(): number;
  adjustBalance(amount: number): number;
  resetBalance(amount?: number): number;
  getGameHistory(): GameHistoryRecord[];
  addGameToHistory(game: GameHistoryRecord): void;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private currentGame: GameState | null;
  private playerBalance: number;
  private gameHistory: GameHistoryRecord[];
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.currentGame = null;
    this.playerBalance = 1000; // Start with $1000 fake money
    this.gameHistory = [];
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Game methods
  getCurrentGame(): GameState | null {
    return this.currentGame;
  }
  
  setCurrentGame(game: GameState): void {
    this.currentGame = game;
  }
  
  getBalance(): number {
    return this.playerBalance;
  }
  
  adjustBalance(amount: number): number {
    this.playerBalance += amount;
    return this.playerBalance;
  }
  
  resetBalance(amount: number = 1000): number {
    this.playerBalance = amount;
    return this.playerBalance;
  }
  
  getGameHistory(): GameHistoryRecord[] {
    return this.gameHistory;
  }
  
  addGameToHistory(game: GameHistoryRecord): void {
    this.gameHistory.unshift(game); // Add to the beginning
    // Keep only the last 50 games
    if (this.gameHistory.length > 50) {
      this.gameHistory = this.gameHistory.slice(0, 50);
    }
  }
}

export const storage = new MemStorage();
