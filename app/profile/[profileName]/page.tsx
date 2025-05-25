import { notFound } from "next/navigation"
import { Star, Users, TrendingUp, Globe, Twitter, Instagram, Youtube, ExternalLink } from "lucide-react"

// Mock data - in a real app, this would come from your API/database
const profiles = {
  "demo-influencer": {
    name: "Alex Chen",
    username: "@alexweb3",
    bio: "Web3 educator, DeFi enthusiast, and blockchain advocate. Helping people navigate the decentralized future.",
    avatar: "/placeholder.svg?height=200&width=200",
    followers: "125K",
    engagement: "8.5%",
    rating: 4.9,
    campaigns: 47,
    categories: ["DeFi", "NFTs", "Web3 Education", "Blockchain"],
    recentCampaigns: [
      { name: "MetaMask Mobile Launch", brand: "MetaMask", performance: "+15% engagement" },
      { name: "Uniswap V4 Education", brand: "Uniswap", performance: "+22% conversions" },
      { name: "Polygon zkEVM Awareness", brand: "Polygon", performance: "+18% reach" },
    ],
    socialLinks: {
      twitter: "https://twitter.com/alexweb3",
      instagram: "https://instagram.com/alexweb3",
      youtube: "https://youtube.com/@alexweb3",
    },
  },
}

export default function ProfilePage({ params }: { params: { profileName: string } }) {
  const profile = profiles[params.profileName as keyof typeof profiles]

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
              src={profile.avatar || "/placeholder.svg"}
              alt={profile.name}
              className="w-32 h-32 rounded-2xl object-cover"
            />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{profile.name}</h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">{profile.username}</p>
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
                  href={profile.socialLinks.twitter}
                  className="p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </a>
                <a
                  href={profile.socialLinks.instagram}
                  className="p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Instagram className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </a>
                <a
                  href={profile.socialLinks.youtube}
                  className="p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Youtube className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </a>
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
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{profile.followers}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Followers</div>
              </div>
              <div className="card-pastel bg-pastel-lavender text-center">
                <TrendingUp className="w-8 h-8 text-gray-800 dark:text-gray-100 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{profile.engagement}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Engagement</div>
              </div>
              <div className="card-pastel bg-pastel-peach text-center">
                <Star className="w-8 h-8 text-gray-800 dark:text-gray-100 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{profile.rating}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Rating</div>
              </div>
              <div className="card-pastel bg-pastel-sage text-center">
                <Globe className="w-8 h-8 text-gray-800 dark:text-gray-100 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{profile.campaigns}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Campaigns</div>
              </div>
            </div>

            {/* Recent Campaigns */}
            <div className="card-pastel bg-white">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Recent Campaigns</h3>
              <div className="space-y-4">
                {profile.recentCampaigns.map((campaign, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-pastel-cream dark:bg-gray-700 rounded-xl"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">{campaign.name}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{campaign.brand}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-medium">{campaign.performance}</div>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-auto mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <div className="card-pastel bg-pastel-mint">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {profile.categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 dark:text-gray-200"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Verification */}
            <div className="card-pastel bg-pastel-lavender">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Verification</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-200">Identity Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-200">Wallet Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-200">Social Accounts Linked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
