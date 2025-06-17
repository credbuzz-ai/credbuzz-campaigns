export interface Influencer {
  x_handle: string | null;
  evm_wallet: string | null;
  solana_wallet: string | null;
}

export interface Campaign {
  campaign_id: string;
  owner_x_handle: string;
  influencer_x_handle: string;
  target_x_handle?: string;
  target_name?: string;
  target_token_symbol?: string;
  project_handle?: string;
  campaign_type: "Public" | "Targeted";
  campaign_name: string;
  description: string;
  status:
    | "OPEN"
    | "PUBLISHED"
    | "ACCEPTED"
    | "FULFILLED"
    | "UNFULFILLED"
    | "DISCARDED";
  payment_token: string;
  payment_token_address: string;
  payment_token_decimals?: number;
  amount: number;
  chain: "Base" | "Solana";
  offer_end_date: string;
  counter?: number;
  project_wallet: string;
  influencer_wallet: string;
  verified_tweet_id?: string;
}

export type UserType = {
  x_handle: string;
  evm_wallet: string;
  solana_wallet: string;
  referral_code_used: string;
  chart_data?: GraphDataPoint[];
  activity_data?: HeatmapData;
  cred_score?: number;
};

export interface HeatmapData {
  handle: string;
  profile_image: string;
  daily_activity: DailyActivity[];
}

export interface DailyActivity {
  day: string;
  activity: ActivityItem[];
}

export interface ActivityItem {
  hour: number;
  avg_tweets: number;
}

export interface ProcessedActivityData {
  day: number;
  hour: number;
  value: number;
  actualTweets: number;
}
export interface GraphDataPoint {
  date: string;
  day: string;
  followers: number;
  smartFollowers: number;
  mindshare: number;
}

export interface InfluencerProfileResponse {
  success: boolean;
  message: string;
  result: {
    handle: string;
    chart_data: GraphDataPoint[];
    activity_data: HeatmapData;
    cred_score: number;
  };
}

export type TopCreator = {
  author_handle: string;
  profile_image_url: string;
};

export type Token = {
  value: string;
  address: string;
  symbol: string;
  decimals: number;
};

export const allowedSolanaTokens: Token[] = [
  {
    value: "PNUT",
    address: "DqzF9xAWWGqkCm3JSxrZxRbSapZCUSvNFjGqczG76RKN",
    symbol: "PNUT",
    decimals: 9,
  },
  {
    value: "GHH",
    address: "8UmwuePr2LHpt1H6aVpvHqp4LeTXDJq7HRH83Xoq5PXn",
    symbol: "GHH",
    decimals: 9,
  },
];

export const allowedBaseTokens: Token[] = [
  {
    value: "USDC",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    symbol: "USDC",
    decimals: 6,
  },
];
