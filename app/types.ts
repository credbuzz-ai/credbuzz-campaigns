export interface ProfileData {
  name: string
  author_handle: string
  bio: string
  profile_image_url: string
  followers_count: number
  followings_count: number
  engagement_score: number
  crypto_tweets_all: number
  crypto_tweets_views_all: number
  total_symbols_mentioned: number
  mentions_24hr: number
  smart_followers_count: number
  new_symbols_mentioned_in_last_24hr: number
  account_created_at: string
  url_in_bio?: string
  tags: string[]
}
