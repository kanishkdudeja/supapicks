"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Contest,
  Pick,
  LeaderboardEntry,
  User,
  Contestant,
  getContestStatus,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy } from "lucide-react";
import { format } from "date-fns";
import { StockPickerModal } from "./stock-picker-modal";

interface ContestDetailProps {
  contest: Contest;
  user: User;
}

export function ContestDetail({ contest, user }: ContestDetailProps) {
  const [userPick, setUserPick] = useState<Pick | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showStockPicker, setShowStockPicker] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchContestData();
  }, [contest.id]);

  const fetchContestData = async () => {
    try {
      const { data: picksData, error: picksError } = await supabase
        .from("picks")
        .select("*")
        .eq("contest_id", contest.id);

      if (picksError) {
        throw picksError;
      }

      if (picksData) {
        const userPickData = picksData.find((pick) => pick.user_id === user.id);
        setUserPick(userPickData || null);

        // Set participant count from the length of picks
        setParticipantCount(picksData.length);

        // Get unique user IDs from picks
        const userIds = [...new Set(picksData.map((pick) => pick.user_id))];

        // Fetch contestant details for all users
        const { data: contestantsData, error: contestantsError } =
          await supabase.from("contestants").select("*").in("id", userIds);

        if (contestantsError) {
          throw contestantsError;
        }

        // Get unique tickers from all picks
        const uniqueTickers = [
          ...new Set(picksData.map((pick) => pick.ticker)),
        ];

        // Fetch current prices for all tickers
        const { data: tickerPrices, error: tickerError } = await supabase
          .from("tickers")
          .select("ticker, price")
          .in("ticker", uniqueTickers);

        if (tickerError) {
          console.error("Error fetching ticker prices:", tickerError);
          // Continue with buy prices if ticker prices fetch fails
        }

        // Create a map of ticker to current price
        const tickerPriceMap = new Map<string, number>();
        tickerPrices?.forEach((ticker) => {
          tickerPriceMap.set(ticker.ticker, ticker.price);
        });

        // Create a map of user_id to contestant data for quick lookup
        const contestantsMap = new Map<string, Contestant>();
        contestantsData?.forEach((contestant) => {
          contestantsMap.set(contestant.id, contestant);
        });

        // Process leaderboard data with real-time calculations
        const sortedEntries = picksData
          .map((entry, index) => {
            const contestant = contestantsMap.get(entry.user_id);
            const currentPrice = tickerPriceMap.get(entry.ticker);

            // Use current price if available, otherwise fall back to buy price
            const effectivePrice = currentPrice ?? entry.buy_price;
            const totalValue = entry.quantity * effectivePrice;

            return {
              user_id: entry.user_id,
              user_name:
                contestant?.username || contestant?.full_name || "Unknown User",
              avatar_url: contestant?.avatar_url,
              ticker: entry.ticker,
              total_value: totalValue,
              rank: index + 1,
            };
          })
          .sort((a, b) => b.total_value - a.total_value)
          .map((entry, index) => ({ ...entry, rank: index + 1 }));

        setLeaderboard(sortedEntries);
      }
    } catch (error) {
      // TODO: Handle error on the UI
      console.error("Error fetching contest data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSuccess = () => {
    // Refresh contest data after successful join
    fetchContestData();
  };

  const status = getContestStatus(contest);
  const canJoin = !userPick && (status === "upcoming" || status === "active");

  if (loading) {
    return <></>;
  }

  const statusColorMap = {
    upcoming: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    ended: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      {/* Contest Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <CardTitle className="text-2xl">{contest.name}</CardTitle>
                <Badge className={statusColorMap[status]}>
                  {status[0].toUpperCase() + status.slice(1)}
                </Badge>
              </div>
              <CardDescription className="text-lg">
                {contest.description || "No description provided"}
              </CardDescription>
            </div>
            {canJoin && (
              <Button
                onClick={() => setShowStockPicker(true)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Join Contest
              </Button>
            )}
            {userPick && (
              <Button variant="outline" size="lg" disabled>
                Already Joined
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Start Date</div>
                <div className="text-sm text-gray-600">
                  {format(new Date(contest.start_time), "MMM d, yyyy")}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">End Date</div>
                <div className="text-sm text-gray-600">
                  {format(new Date(contest.end_time), "MMM d, yyyy")}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Participants</div>
                <div className="text-sm text-gray-600">{participantCount}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span>Leaderboard</span>
            </CardTitle>
            <CardDescription>Current rankings</CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">
                  No participants yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.user_id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium">
                        {entry.rank}
                      </div>
                      <div className="flex items-center space-x-2">
                        {entry.avatar_url && (
                          <img
                            src={entry.avatar_url}
                            alt="Avatar"
                            className="h-6 w-6 rounded-full"
                          />
                        )}
                        <span className="font-medium">{entry.user_name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${entry.total_value.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {entry.ticker}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contest Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Contest Rules</CardTitle>
            <CardDescription>How to play and win</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium">Starting Capital</div>
                  <div className="text-sm text-gray-600">
                    Every participant gets $1000 to invest
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium">Single Pick</div>
                  <div className="text-sm text-gray-600">
                    Choose one security (stock, ETF, commodity)
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium">No Trading</div>
                  <div className="text-sm text-gray-600">
                    Once you pick, you&apos;re locked in until the end
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium">Winner</div>
                  <div className="text-sm text-gray-600">
                    Highest portfolio value at the end wins
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Picker Modal */}
      <StockPickerModal
        contest={contest}
        user={user}
        isOpen={showStockPicker}
        onClose={() => setShowStockPicker(false)}
        onSuccess={handleJoinSuccess}
      />
    </div>
  );
}
