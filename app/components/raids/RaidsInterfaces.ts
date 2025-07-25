export interface LeftSectionItem {
  token_id: string;
  symbol: string;
  name: string;
  chain: string;
  profile_image_url?: string;
  twitter_final?: string;
  mention_count_24hr?: number;
  mention_count?: number;
  marketcap?: number;
  volume_24hr?: number;
  pc_24_hr?: number;
  narrative?: string;
}

export interface Tweet {
  tweet_id: string;
  author_handle: string;
  profile_image_url: string;
  body: string;
  tweet_create_time: string;
  reply_count: number;
  retweet_count: number;
  like_count: number;
  view_count: number;
  sentiment: number;
  tweet_category: string;
}

export interface TokenDetails {
  token_id: string;
  symbol: string;
  name: string;
  chain: string;
  twitter_final: string;
  profile_image_url: string;
  twitter_bio: string;
  website_final: string;
  telegram_final: string;
  mention_count_24hr: number;
  total_accounts_24hr: number;
  influencer_count_24hr: number;
  marketcap: number;
  volume_24hr: number;
  pc_24_hr: number;
  narrative: string;
}

export interface HandleDetails {
  author_handle: string;
  profile_image_url: string;
  bio: string;
}

export interface TrendingToken extends LeftSectionItem {
  mention_count_24hr: number;
  total_accounts_24hr: number;
  influencer_count_24hr: number;
}

export interface SearchToken extends LeftSectionItem {
  mention_count: number;
  total_accounts: number;
  influencer_count: number;
}

export interface TrendingTokensResponse {
  result: TrendingToken[];
}

export interface SearchResultsResponse {
  result: SearchToken[];
}

export interface AuthorDetailsFullResponse {
  result: {
    handle: HandleDetails;
    token?: TokenDetails;
  };
}

export interface GenerateResponseRequest {
  tweet_content: string;
  tweet_context: {
    author_handle: string;
    symbol: string;
    sentiment: number;
    tweet_category: string;
  };
  response_type: string;
  tone: string;
}

export interface GenerateResponseResponse {
  result: {
    response_text: string;
    twitter_intent_url: string;
  };
}

export interface TweetFeedResponse {
  result: {
    original_tweets: Tweet[];
    mentions: Tweet[];
    pagination: {
      start: number;
      limit: number;
      has_more: boolean;
      next_start: number;
    };
  };
}
