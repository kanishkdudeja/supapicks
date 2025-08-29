export interface Contest {
  id: string;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface Pick {
  id: string;
  contest_id: string;
  user_id: string;
  ticker: string;
  quantity: number;
  buy_price: number;
  created_at: string;
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

export interface ContestWithParticipants extends Contest {
  participant_count: number;
}

export interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  ticker: string;
  total_value: number;
  gain_loss: number;
  gain_loss_percentage: number;
  rank: number;
}
