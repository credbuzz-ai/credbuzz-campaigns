export interface ProfileData {
  name: string
  author_handle: string
  bio: string
  profile_image_url: string
  followers_count: number
  smart_followers_count: number
  mindshare: number
}

export interface ChartDataPoint {
  date: string
  label: string
  followers_count: number
  smart_followers_count: number
  mindshare: number
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
