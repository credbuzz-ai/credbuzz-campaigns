import { notFound } from "next/navigation"
import { Users, Brain } from "lucide-react"
import type { ProfileData, UserProfileResponse, ChartDataPoint } from "../../types"
import { GrowthChart, ActivityChart } from "../../components/ProfileCharts"

async function getProfileData(authorHandle: string): Promise<{ profile: ProfileData; chartData: ChartDataPoint[]; activityData: UserProfileResponse['result']['activity_data'] } | null> {
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
        const data = await response.json()
        if (data.result) {
          const chartData = data.result.chart_data.map((entry: [string, string, number, number, number]) => {
            const [date, label, followers, smartFollowers, mindshare] = entry;
            return {
              date,
              label,
              followers_count: followers,
              smart_followers_count: smartFollowers,
              mindshare
            };
          })

          return {
            profile: {
              name: authorHandle,
              author_handle: authorHandle,
              bio: "",
              profile_image_url: data.result.activity_data.profile_image,
              followers_count: chartData[chartData.length - 1].followers_count,
              smart_followers_count: chartData[chartData.length - 1].smart_followers_count,
              mindshare: chartData[chartData.length - 1].mindshare
            },
            chartData,
            activityData: data.result.activity_data
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching profile data:", error)
  }

  return null
}

export default async function ProfilePage({ params }: { params: { profileName: string } }) {
  const profileName = await Promise.resolve(params.profileName)
  const data = await getProfileData(profileName)

  if (!data) {
    notFound()
  }

  const { profile, chartData, activityData } = data
  const formattedMindshare = typeof profile.mindshare === 'number' 
    ? profile.mindshare.toFixed(1)
    : '0.0'

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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
                  <p className="text-xl text-gray-600 mb-4">@{profile.author_handle}</p>
                </div>
                <div className="flex gap-3">
                  <button className="btn-primary">Hire for Campaign</button>
                  <button className="btn-secondary">Message</button>
                </div>
              </div>
              <p className="text-gray-700 mb-6">{profile.bio}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card-pastel !bg-pastel-mint text-center">
            <Users className="w-8 h-8 text-gray-800 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {profile.followers_count.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Followers</div>
          </div>
          <div className="card-pastel !bg-pastel-lavender text-center">
            <Users className="w-8 h-8 text-gray-800 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {profile.smart_followers_count.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Smart Followers</div>
          </div>
          <div className="card-pastel !bg-pastel-peach text-center">
            <Brain className="w-8 h-8 text-gray-800 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {formattedMindshare}
            </div>
            <div className="text-sm text-gray-600">Mindshare Score</div>
          </div>
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="card-pastel !bg-white mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Growth Trends</h2>
            <GrowthChart data={chartData} />
          </div>
        )}

        {/* Activity Heatmap */}
        {activityData.daily_activity.length > 0 && (
          <ActivityChart activityData={activityData} />
        )}
      </div>
    </div>
  )
}
