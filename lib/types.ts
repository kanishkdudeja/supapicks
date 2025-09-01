export interface Contest {
  id: string;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface Pick {
  contest_id: string;
  user_id: string;
  ticker: string;
  quantity: number;
  buy_price: number;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    user_name?: string;
    avatar_url?: string;
    full_name?: string;
  };
}

export interface Contestant {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url: string;
}

export interface ContestWithParticipants extends Contest {
  participant_count: number;
}

export interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  ticker: string;
  quantity: number;
  buy_price: number;
  current_price: number;
  current_value: number;
  rank: number;
}

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  companyName: string;
}

export const getContestStatus = (contest: Contest) => {
  const now = new Date();
  const startTime = new Date(contest.start_time);
  const endTime = new Date(contest.end_time);

  if (now < startTime) {
    return "upcoming";
  } else if (now >= startTime && now <= endTime) {
    return "active";
  } else {
    return "ended";
  }
};
