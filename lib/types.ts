export interface CollaborateFormData {
  campaignId: string;
  influencerUserId?: string;
  brandId?: string;
  businessWalletAddr?: string;
  businessSolanaAddress?: string;
  influencerWalletAddr?: string;
  influencerSolanaAddress?: string;
  status?: string;
  projectName?: string;
  description?: string;
  influencerHandle?: string;
  xAccount?: string;
  website?: string;
  offerEnds?: string;
  promotionEnds?: string;
  paymentToken?: string;
  tokenAmount?: number;
  poolAmount?: number;
  tweetUrl?: string;
  chain?: "Base" | "Solana";
  counter?: number;
  campaignType?: "Public" | "Targeted";
  tokenAddress?: string;
  tokenDecimals?: number;
}

export interface Influencer {
  user_id: number;
  username: string | null;
  twitter_handle: string | null;
  wallet_addr: string | null;
  solana_address?: string;
}

export interface Campaign {
  campaign_id: string;
  brand_id: number;
  business_wallet_addr: string;
  business_solana_address?: string;
  influencer_user_id: number;
  influencer_wallet_addr: string;
  influencer_solana_address?: string;
  project_name?: string;
  name?: string;
  description?: string;
  x_author_handle?: string;
  website?: string;
  amount?: number;
  pool_amount?: number;
  status: string;
  offer_end_date: number;
  promotion_end_date: number;
  tweet_url?: string;
  chain?: string;
  counter?: number;
  campaign_type: "Public" | "Targeted";
  token_address?: string;
  token_decimals?: number;
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
  user_id: number;
  brand_id?: number;
  user_type: string;
  name: string;
  email: string;
  avatar?: string;
  wallet_addr?: string;
  solana_address?: string;
  username?: string;
  twitter_handle?: string;
  youtube_channel?: string;
  title?: string;
  about?: string;
  bio?: string;
  has_password?: boolean;
  packages?: PackageData[];
  content_categories?: string[];
  specialities?: string[];
  platforms?: string[];
  account_created_at: string;
  referral_code?: string;
  referral_code_used?: boolean;
  followers?: number;
  smart_followers?: number;
  url_in_bio?: string;
  profile_image_url?: string;
  profile_banner_url?: string;
  followers_count?: number;
  cred_score?: number;
  total_referrals?: number;
  total_points?: number;
  x_follow_claimed?: boolean;
  chart_data?: GraphDataPoint[];
  activity_data?: HeatmapData;
  industry?: string;
  budget?: string;
  content_volume?: string;
  brand_categories?: BrandCategory[];
  brand_platforms?: BrandPlatform[];
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
  address: string;
  symbol: string;
  decimals: number;
};

export interface CampaignParticipant {
  campaign_id: string;
  user_id: number;
  submission_url: string;
}

export const allowedTokens: Token[] = [
  {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    symbol: "USDC",
    decimals: 6,
  },
  {
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    symbol: "DAI",
    decimals: 18,
  },
];

export const allowedSolanaTokens: Token[] = [
  {
    address: "DqzF9xAWWGqkCm3JSxrZxRbSapZCUSvNFjGqczG76RKN",
    symbol: "PNUT",
    decimals: 9,
  },
  {
    address: "8UmwuePr2LHpt1H6aVpvHqp4LeTXDJq7HRH83Xoq5PXn",
    symbol: "GHH",
    decimals: 9,
  },
];

export const paymentTokens = [
  {
    value: "usdc",
    label: "USDC",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
  },
  {
    value: "usdt",
    label: "USDT",
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    decimals: 18,
  },
];
