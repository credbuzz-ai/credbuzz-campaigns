import { notFound } from "next/navigation"
import { Star, Users, TrendingUp, Globe, Twitter, Instagram, Youtube, ExternalLink } from "lucide-react"
import { ProfileData } from "../../types"

async function getProfileData(authorHandle: string): Promise<ProfileData | null> {
  try {
    const response = await fetch(
      `http://api.cred.buzz/user/author-handle-details?author_handle=${authorHandle}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    )
    
    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText)
      return null
    }

    // Check if the response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.error('API did not return JSON:', contentType)
      return null
    }

    const data = await response.json()
    if (!data.result) {
      console.error('No result in API response')
      return null
    }
    return data.result
  } catch (error) {
    console.error('Error fetching profile data:', error)
    return null
  }
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
              src={profile.profile_image_url || "/placeholder.svg"}
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
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{profile.followers_count}</div>
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
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{profile.total_symbols_mentioned}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Symbols Mentioned</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="card-pastel bg-white mb-8">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-pastel-cream dark:bg-gray-700 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Crypto Tweet Views</div>
                  <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{profile.crypto_tweets_views_all.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-pastel-cream dark:bg-gray-700 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-300">24h Mentions</div>
                  <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{profile.mentions_24hr}</div>
                </div>
                <div className="p-4 bg-pastel-cream dark:bg-gray-700 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Smart Followers</div>
                  <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{profile.smart_followers_count}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            {profile.tags.length > 0 && (
              <div className="card-pastel bg-pastel-mint">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 dark:text-gray-200"
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
                  <span className="text-gray-800 dark:text-gray-100">{new Date(profile.account_created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-200">Following</span>
                  <span className="text-gray-800 dark:text-gray-100">{profile.followings_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-200">24h New Symbols</span>
                  <span className="text-gray-800 dark:text-gray-100">{profile.new_symbols_mentioned_in_last_24hr}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
