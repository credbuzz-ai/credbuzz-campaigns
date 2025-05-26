export interface ProfileData {
  name: string
  author_handle: string
  bio: string
  profile_image_url: string
  followers_count: number
  smart_followers_count: number
  mindshare: number
  account_created_at?: string
}

export interface ChartDataPoint {
  date: string
  label?: string
  followers_count: number
  smart_followers_count: number
  mindshare: number
  value?: number
  originalValue?: number
}

export interface ActivityData {
  hour: number
  avg_tweets: number
}

export interface DailyActivity {
  day: string
  activity: ActivityData[]
}

export interface UserProfileResponse {
  result: {
    chart_data: [string, string, number, number, number][]
    activity_data: {
      handle: string
      daily_activity: DailyActivity[]
      profile_image: string
    }
    cred_score: number
  }
  message: string
}

export interface AuthorDetailsResponse {
  result: {
    name: string
    account_created_at: string
    bio: string
    author_handle: string
  }
  message: string
}

export interface Tweet {
  tweet_id: string
  author_handle: string
  body: string
  tweet_create_time: string
  view_count: number
  like_count: number
  quote_count: number
  reply_count: number
  retweet_count: number
  profile_image_url: string
  sentiment: number | null
  tweet_category?: string | null
}

export interface TopTweetsResponse {
  result: Tweet[]
  message: string
}

export interface TokenData {
  symbol: string
  total_tweets: number
  first_tweet_time: string
  last_tweet_time: string
  icon: string | null
  narratives: string[]
  volume_24hr: number
}

export interface TokenOverviewResponse {
  result: {
    unique_token_count: number
    total_mentions: number
    most_mentioned_token: {
      symbol: string
      mention_count: number
    }
    narrative_breakdown: Record<string, number>
    tokens: TokenData[]
  }
  message: string
}
