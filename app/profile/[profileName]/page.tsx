import { notFound } from "next/navigation"
import { Star, Users, TrendingUp, Globe, Twitter, ExternalLink } from "lucide-react"
import type { ProfileData } from "../../types"

// Fallback profile data for demo purposes
const fallbackProfiles: Record<string, ProfileData> = {
  credbuzzai: {
    name: "CredBuzz AI",
    author_handle: "credbuzzai",
    bio: "AI-powered Web3 influencer marketplace. Connecting brands with authentic KOLs in the decentralized ecosystem.",
    profile_image_url: "/placeholder.svg?height=200&width=200",
    followers_count: 15420,
    followings_count: 892,
    engagement_score: 8.7,
    crypto_tweets_all: 1247,
    crypto_tweets_views_all: 2840000,
    total_symbols_mentioned: 156,
    mentions_24hr: 23,
    smart_followers_count: 8934,
    new_symbols_mentioned_in_last_24hr: 5,
    account_created_at: "2023-01-15T00:00:00Z",
    url_in_bio: "https://cred.buzz",
    tags: ["AI", "Web3", "DeFi", "Blockchain", "KOL", "Marketing"],
  },
  "demo-influencer": {
    name: "Alex Chen",
    author_handle: "demo-influencer",
    bio: "Web3 educator, DeFi enthusiast, and blockchain advocate. Helping people navigate the decentralized future.",
    profile_image_url: "/placeholder.svg?height=200&width=200",
    followers_count: 125000,
    followings_count: 1200,
    engagement_score: 8.5,
    crypto_tweets_all: 2847,
    crypto_tweets_views_all: 5200000,
    total_symbols_mentioned: 234,
    mentions_24hr: 45,
    smart_followers_count: 12500,
    new_symbols_mentioned_in_last_24hr: 8,
    account_created_at: "2021-03-10T00:00:00Z",
    url_in_bio: "https://alexweb3.com",
    tags: ["DeFi", "NFTs", "Web3 Education", "Blockchain", "Ethereum"],
  },
}

async function getProfileData(authorHandle: string): Promise<ProfileData | null> {
  try {
    // Try to fetch from API first
    const response = await fetch(`https://api.cred.buzz/user/author-handle-details?author_handle=${authorHandle}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
      // Add timeout
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        if (data.result) {
          return data.result
        }
      }
    }
  } catch (error) {
    console.log("API fetch failed, using fallback data:", error)
  }

  // Return fallback data if API fails or profile exists in fallback
  return fallbackProfiles[authorHandle] || null
}

export default async function ProfilePage({ params }: { params: { profileName: string } }) {
  const profileName = await Promise.resolve(params.profileName)
  const profile = await getProfileData(profileName)

  if (!profile) {
    notFound()
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="card-pastel bg-pastel-beige mb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <img
              src={profile.profile_image_url || "/placeholder.svg?height=200&width=200"}
              alt={profile.name}
              className="w-32 h-32 rounded-2xl object-cover"
            />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{profile.name}</h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">@{profile.author_handle}</p>
                </div>
                <div className="flex gap-3">
                  <button className="btn-primary">Hire for Campaign</button>
                  <button className="btn-secondary">Message</button>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-200 mb-6">{profile.bio}</p>

              {/* Social Links */}
              <div className="flex gap-4">
                <a
                  href={`https://twitter.com/${profile.author_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </a>
                {profile.url_in_bio && (
                  <a
                    href={profile.url_in_bio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Stats */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="card-pastel bg-pastel-mint text-center">
                <Users className="w-8 h-8 text-gray-800 dark:text-gray-100 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {profile.followers_count.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Followers</div>
              </div>
              <div className="card-pastel bg-pastel-lavender text-center">
                <TrendingUp className="w-8 h-8 text-gray-800 dark:text-gray-100 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{profile.engagement_score}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Engagement</div>
              </div>
              <div className="card-pastel bg-pastel-peach text-center">
                <Star className="w-8 h-8 text-gray-800 dark:text-gray-100 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{profile.crypto_tweets_all}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Crypto Tweets</div>
              </div>
              <div className="card-pastel bg-pastel-sage text-center">
                <Globe className="w-8 h-8 text-gray-800 dark:text-gray-100 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {profile.total_symbols_mentioned}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Symbols Mentioned</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="card-pastel bg-white mb-8">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-pastel-cream dark:bg-gray-700 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Crypto Tweet Views</div>
                  <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {profile.crypto_tweets_views_all.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-pastel-cream dark:bg-gray-700 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-300">24h Mentions</div>
                  <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{profile.mentions_24hr}</div>
                </div>
                <div className="p-4 bg-pastel-cream dark:bg-gray-700 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Smart Followers</div>
                  <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {profile.smart_followers_count.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            {profile.tags && profile.tags.length > 0 && (
              <div className="card-pastel bg-pastel-mint">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white dark:bg-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Account Info */}
            <div className="card-pastel bg-pastel-lavender">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Account Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-200">Joined</span>
                  <span className="text-gray-800 dark:text-gray-100">
                    {new Date(profile.account_created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-200">Following</span>
                  <span className="text-gray-800 dark:text-gray-100">{profile.followings_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-200">24h New Symbols</span>
                  <span className="text-gray-800 dark:text-gray-100">{profile.new_symbols_mentioned_in_last_24hr}</span>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="card-pastel bg-pastel-peach">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Verification</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-200">Profile Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-200">Social Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-200">Crypto Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
