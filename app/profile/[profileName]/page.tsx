import { notFound } from "next/navigation"
import type { ProfileData, UserProfileResponse, ChartDataPoint, AuthorDetailsResponse } from "../../types"
import { ProfileCharts } from "../../components/ProfileCharts"
import SmartFeed from "../../components/SmartFeed"

// Fallback profile data for demo purposes
const fallbackProfiles: Record<string, ProfileData> = {
  credbuzzai: {
    name: "CredBuzz AI",
    author_handle: "credbuzzai",
    bio: "AI-powered Web3 influencer marketplace. Connecting brands with authentic KOLs in the decentralized ecosystem.",
    profile_image_url: "/placeholder.svg?height=200&width=200",
    followers_count: 15420,
    smart_followers_count: 8934,
    mindshare: 8.7,
    account_created_at: "2023-01-15T10:30:00Z",
  },
  "demo-influencer": {
    name: "Alex Chen",
    author_handle: "demo-influencer",
    bio: "Web3 educator, DeFi enthusiast, and blockchain advocate. Helping people navigate the decentralized future.",
    profile_image_url: "/placeholder.svg?height=200&width=200",
    followers_count: 125000,
    smart_followers_count: 12500,
    mindshare: 8.5,
    account_created_at: "2022-03-20T14:45:00Z",
  },
  eliz883: {
    name: "Eliz",
    author_handle: "eliz883",
    bio: "Crypto trader and analyst. Sharing insights about DeFi, altcoins, and market trends.",
    profile_image_url: "/placeholder.svg?height=200&width=200",
    followers_count: 89420,
    smart_followers_count: 12340,
    mindshare: 9.2,
    account_created_at: "2022-08-10T14:30:00Z",
  },
}

function generateRealistic30DayData(baseProfile: ProfileData): ChartDataPoint[] {
  const data: ChartDataPoint[] = []
  const today = new Date()

  // Generate 30 days of data with realistic trends
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Create realistic growth patterns with some volatility
    const dayProgress = (29 - i) / 29 // 0 to 1 over 30 days

    // Followers: gradual growth with some daily variation
    const followersGrowthRate = 0.15 // 15% growth over 30 days
    const followersVariation = (Math.random() - 0.5) * 0.02 // ±1% daily variation
    const followersMultiplier = 1 + followersGrowthRate * dayProgress + followersVariation

    // Smart followers: slightly different pattern
    const smartFollowersGrowthRate = 0.12 // 12% growth over 30 days
    const smartFollowersVariation = (Math.random() - 0.5) * 0.025 // ±1.25% daily variation
    const smartFollowersMultiplier = 1 + smartFollowersGrowthRate * dayProgress + smartFollowersVariation

    // Mindshare: more volatile, can go up or down
    const mindshareBaseChange = Math.sin(dayProgress * Math.PI * 2) * 0.1 // Cyclical pattern
    const mindshareVariation = (Math.random() - 0.5) * 0.05 // ±2.5% daily variation
    const mindshareMultiplier = 1 + mindshareBaseChange + mindshareVariation

    data.push({
      date: date.toISOString().split("T")[0],
      label: `Day ${30 - i}`,
      followers_count: Math.round(baseProfile.followers_count * followersMultiplier),
      smart_followers_count: Math.round(baseProfile.smart_followers_count * smartFollowersMultiplier),
      mindshare: Math.max(0, baseProfile.mindshare * mindshareMultiplier),
    })
  }

  return data
}

async function fetchUserProfile(authorHandle: string): Promise<UserProfileResponse | null> {
  try {
    const response = await fetch(`https://api.cred.buzz/user/get-user-profile?handle=${authorHandle}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return (await response.json()) as UserProfileResponse
      }
    }
  } catch (error) {
    console.log("User profile API fetch failed:", error)
  }
  return null
}

async function fetchAuthorDetails(authorHandle: string): Promise<AuthorDetailsResponse | null> {
  try {
    const response = await fetch(`https://api.cred.buzz/user/author-handle-details?author_handle=${authorHandle}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return (await response.json()) as AuthorDetailsResponse
      }
    }
  } catch (error) {
    console.log("Author details API fetch failed:", error)
  }
  return null
}

async function getProfileData(authorHandle: string): Promise<{
  profile: ProfileData
  chartData: ChartDataPoint[]
  activityData: UserProfileResponse["result"]["activity_data"]
} | null> {
  try {
    // Make parallel API calls
    const [userProfileData, authorDetailsData] = await Promise.all([
      fetchUserProfile(authorHandle),
      fetchAuthorDetails(authorHandle),
    ])

    if (userProfileData?.result) {
      const chartData = userProfileData.result.chart_data.map(
        ([date, label, followers, smartFollowers, mindshare]) => ({
          date,
          label,
          followers_count: followers,
          smart_followers_count: smartFollowers,
          mindshare,
        }),
      )

      // Merge data from both APIs
      const profile: ProfileData = {
        name: authorDetailsData?.result?.name || authorHandle,
        author_handle: authorHandle,
        bio: authorDetailsData?.result?.bio || "",
        profile_image_url: userProfileData.result.activity_data.profile_image,
        followers_count: chartData[chartData.length - 1].followers_count,
        smart_followers_count: chartData[chartData.length - 1].smart_followers_count,
        mindshare: chartData[chartData.length - 1].mindshare,
        account_created_at: authorDetailsData?.result?.account_created_at,
      }

      return {
        profile,
        chartData,
        activityData: userProfileData.result.activity_data,
      }
    }
  } catch (error) {
    console.log("API fetch failed, using fallback data:", error)
  }

  // Return fallback data if API fails or profile exists in fallback
  const fallbackProfile = fallbackProfiles[authorHandle]
  if (fallbackProfile) {
    // Generate realistic 30-day chart data
    const realistic30DayData = generateRealistic30DayData(fallbackProfile)

    // Update profile with current (latest) data
    const latestData = realistic30DayData[realistic30DayData.length - 1]
    const updatedProfile = {
      ...fallbackProfile,
      followers_count: latestData.followers_count,
      smart_followers_count: latestData.smart_followers_count,
      mindshare: latestData.mindshare,
    }

    return {
      profile: updatedProfile,
      chartData: realistic30DayData,
      activityData: {
        handle: authorHandle,
        daily_activity: [],
        profile_image: fallbackProfile.profile_image_url,
      },
    }
  }

  return null
}

function formatAccountCreatedDate(dateString?: string): string {
  if (!dateString) return ""

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffYears = Math.floor(diffDays / 365)
    const diffMonths = Math.floor(diffDays / 30)

    if (diffYears > 0) {
      return `Joined ${diffYears} year${diffYears > 1 ? "s" : ""} ago`
    } else if (diffMonths > 0) {
      return `Joined ${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`
    } else {
      return `Joined ${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    }
  } catch (error) {
    return ""
  }
}

export default async function ProfilePage({ params }: { params: { profileName: string } }) {
  const profileName = await Promise.resolve(params.profileName)
  const data = await getProfileData(profileName)

  if (!data) {
    notFound()
  }

  const { profile, chartData, activityData } = data
  const accountCreatedText = formatAccountCreatedDate(profile.account_created_at)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Main Content */}
        <div className="flex-1 py-8 px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="card-pastel !bg-pastel-beige mb-8">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <img
                  src={profile.profile_image_url || "/placeholder.svg?height=200&width=200"}
                  alt={profile.name}
                  className="w-32 h-32 rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-800 mb-2">{profile.name}</h1>
                      <div className="flex flex-col gap-1 mb-4">
                        <p className="text-xl text-gray-600">@{profile.author_handle}</p>
                        {accountCreatedText && <p className="text-sm text-gray-500">{accountCreatedText}</p>}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="btn-primary">Hire for Campaign</button>
                      <button className="btn-secondary">Message</button>
                    </div>
                  </div>
                  {profile.bio && <p className="text-gray-700 mb-6">{profile.bio}</p>}
                </div>
              </div>
            </div>

            {/* Chart Cards */}
            <ProfileCharts chartData={chartData} activityData={activityData} />

            {/* Additional bottom spacing to ensure smart feed extends fully */}
            <div className="h-32"></div>
          </div>
        </div>

        {/* Smart Feed Sidebar - Full Height */}
        <SmartFeed authorHandle={profile.author_handle} />
      </div>
    </div>
  )
}
