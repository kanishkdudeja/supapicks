"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Search } from "lucide-react";
import { Contest, User, StockData } from "@/lib/types";

interface StockPickerModalProps {
  contest: Contest;
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StockPickerModal({
  contest,
  user,
  isOpen,
  onClose,
  onSuccess,
}: StockPickerModalProps) {
  const [ticker, setTicker] = useState("");
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const supabase = createClient();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTicker("");
      setStockData(null);
      setError(null);
    }
  }, [isOpen]);

  const searchStock = async () => {
    if (!ticker.trim()) return;

    setLoading(true);
    setError(null);
    setStockData(null);

    try {
      const response = await fetch(
        `/api/stocks/search?ticker=${ticker.toUpperCase()}`,
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setStockData(data);
    } catch (error) {
      console.error("Error searching stock:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch stock data",
      );
    } finally {
      setLoading(false);
    }
  };

  const joinContest = async () => {
    if (!stockData || !stockData.price) {
      setError("Invalid stock data. Please try searching again.");
      return;
    }

    setJoining(true);
    try {
      const quantity = 1000 / stockData.price;

      const { error: pickError } = await supabase.from("picks").insert({
        contest_id: contest.id,
        user_id: user.id,
        ticker: stockData.symbol,
        quantity: quantity,
        buy_price: stockData.price,
      });

      if (pickError) throw pickError;

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error joining contest:", error);
      setError("Failed to join contest. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchStock();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Join Contest</CardTitle>
              <CardDescription>
                Pick your security for &quot;{contest.name}&quot;
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="ticker"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ticker Symbol
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="ticker"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., AAPL, GOOGL, BTC-USD"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
                <Button
                  onClick={searchStock}
                  disabled={loading || !ticker.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "..." : <Search className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter a ticker symbol
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {stockData && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {stockData.symbol}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {stockData.companyName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Current Price</div>
                    <div className="text-xl font-bold text-green-600">
                      ${stockData.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="text-sm text-blue-900">
                    <div>
                      With $1000, you can buy{" "}
                      <span className="font-bold">
                        {(1000 / stockData.price).toFixed(4)} shares
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={joining}
              >
                Cancel
              </Button>
              <Button
                onClick={joinContest}
                disabled={!stockData || joining}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {joining ? "Joining..." : "Join Contest"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
