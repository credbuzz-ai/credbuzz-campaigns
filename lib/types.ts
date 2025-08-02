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
  status: "Ongoing" | "Completed" | "Upcoming";
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
  is_visible: boolean;
  project_twitter?: string;
  project_whitepaper?: string;
  project_website?: string;
  project_telegram?: string;
  project_insta?: string;
  project_discord?: string;
  project_gitbook?: string;
  project_categories?: string;
  owner_info?: {
    name?: string;
    profile_image_url?: string;
    followers_count: number;
    followings_count: number;
    smart_followers_count?: number;
    engagement_score?: number;
  };
  campaign_rules?: string;
  ignore_accounts?: string;
  sub_campaigns?: Campaign[];
  seo_keywords?: string;
}

export type ReferralEntry = {
  x_handle: string;
  used_time: string;
  remaining_action: string;
};

export type UserType = {
  x_handle: string;
  evm_wallet: string;
  solana_wallet: string;
  celo_wallet: string;
  referral_code: string;
  referral_code_used: string;
  chart_data?: GraphDataPoint[];
  activity_data?: HeatmapData;
  cred_score?: number;
  total_referrals?: number;
  x_follow_claimed?: boolean;
  total_points?: number;
  // extra user info
  name?: string;
  profile_image_url?: string;
  followers?: number;
  followings?: number;
  smart_followers?: number;
  engagement_score?: number;
  mindshare?: number;
  referrals: ReferralEntry[];
  partial_referrals: ReferralEntry[];
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

export interface Task {
  id: number;
  title: string;
  description: string;
  total: number;
  completed: number;
  points: number;
  action?: () => Promise<void>;
  link?: string;
}
