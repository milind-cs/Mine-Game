import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { usePlayerStore } from "@/lib/stores/usePlayerStore";
import { apiRequest } from "@/lib/queryClient";
import { useAudio } from "@/lib/stores/useAudio";

const DepositPanel = () => {
  const [amount, setAmount] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const { updateBalance } = usePlayerStore();

  const handleDeposit = async () => {
    if (amount <= 0) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/player/deposit", { amount });
      const data = await response.json();
      
      // Update local state
      updateBalance(amount);
      
      // Play success sound
      useAudio.getState().playSuccess();
      
      // Reset form
      setAmount(100);
    } catch (error) {
      console.error("Failed to deposit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(isNaN(value) ? 0 : value);
  };

  return (
    <Card>
      <CardHeader className="py-2 sm:py-3 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-lg">Deposit Funds</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="amount">Amount ($)</Label>
          <div className="flex space-x-2">
            <Input
              id="amount"
              type="number"
              min="1"
              value={amount}
              onChange={handleChange}
              className="flex-1"
            />
            <Button 
              onClick={handleDeposit} 
              disabled={isLoading || amount <= 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? "Processing..." : "Deposit"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DepositPanel;