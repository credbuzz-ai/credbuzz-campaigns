export interface Influencer {
  x_handle: string | null;
  evm_wallet: string | null;
  solana_wallet: string | null;
}

export interface Campaign {
  campaign_id: string;
  project_x_handle: string;
  influencer_x_handle: string;
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
  token: string;
  token_address: string;
  token_decimals: number;
  amount: number;
  chain: "Base" | "Solana";
  offer_end_date: number;
  counter?: number;
  project_wallet: string;
  influencer_wallet: string;
}

export type Category =
  | "crypto"
  | "entertainment"
  | "finance"
  | "gaming"
  | "social-impact"
  | "sports"
  | "startups"
  | "tech";

export type Specialities =
  | "tweets"
  | "threads"
  | "memes-gifs"
  | "polls"
  | "live-events"
  | "spaces"
  | "short-videos"
  | "long-videos";

export type Platform = {
  name: string;
  connected: boolean;
  handle: string;
};

export type BrandPlatform = {
  id: string;
  title: string;
  icon: React.ReactNode;
};

export type Industry =
  | "agency"
  | "ecommerce"
  | "website-app"
  | "brick-mortar"
  | "other";

export type BrandCategory = {
  id: string;
  title: string;
};

export type ContentVolume = "0-5" | "5-10" | "10-20" | "20-50" | "50+";

export type Budget =
  | "under-10k"
  | "10k-50k"
  | "50k-100k"
  | "100k-500k"
  | "500k+";

export type PackageData = {
  id?: number;
  platform: string;
  content_type: string;
  package_name: string;
  package_description: string;
  content_pieces: number;
  price: number;
};

export const CONTENT_TYPES = {
  youtube: ["short-videos", "long-videos", "live-events"],
  x: ["tweet", "thread", "spaces", "memes-gifs", "polls"],
};

export type MockCampaign = {
  id: string;
  name: string;
  status: "active" | "paused" | "completed";
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  engagement: number;
  reach: number;
};

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

export interface CampaignParticipant {
  campaign_id: string;
  user_id: number;
  submission_url: string;
}

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
  {
    value: "USDT",
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    symbol: "USDT",
    decimals: 18,
  },
];
