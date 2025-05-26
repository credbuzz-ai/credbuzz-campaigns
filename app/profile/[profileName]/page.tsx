import { notFound } from "next/navigation"
import { Users } from "lucide-react"
import type { ProfileData } from "../../types"

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
  },
  "demo-influencer": {
    name: "Alex Chen",
    author_handle: "demo-influencer",
    bio: "Web3 educator, DeFi enthusiast, and blockchain advocate. Helping people navigate the decentralized future.",
    profile_image_url: "/placeholder.svg?height=200&width=200",
    followers_count: 125000,
    smart_followers_count: 12500,
    mindshare: 8.5,
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
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Stats */}
          <div className="card-pastel bg-white">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Profile Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-pastel-cream dark:bg-gray-700 rounded-xl">
                <div className="text-sm text-gray-600 dark:text-gray-300">Followers</div>
                <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {profile.followers_count.toLocaleString()}
                </div>
              </div>
              <div className="p-4 bg-pastel-cream dark:bg-gray-700 rounded-xl">
                <div className="text-sm text-gray-600 dark:text-gray-300">Smart Followers</div>
                <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {profile.smart_followers_count.toLocaleString()}
                </div>
              </div>
              <div className="p-4 bg-pastel-cream dark:bg-gray-700 rounded-xl">
                <div className="text-sm text-gray-600 dark:text-gray-300">Mindshare</div>
                <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {profile.mindshare}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
