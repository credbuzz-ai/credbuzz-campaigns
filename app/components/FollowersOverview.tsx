"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

// Type definitions
interface Follower {
  handle: string
  profile_name: string
  profile_image_url: string
  tags: string[]
  followers_count: number
  smart_followers: number
  account_created_at: string
}

interface FollowersData {
  followings: Follower[]
  is_more_data: boolean
}

interface ApiResponse {
  result: FollowersData
  message: string
}

// Color scheme for tags
const TAG_COLORS = {
  influencer: "#8884d8",
  project: "#82ca9d", 
  project_member: "#ffc658",
  project_coin: "#ff7300",
  project_main: "#0088fe",
  venture_capital: "#ff69b4",
  unknown: "#808080"
}

// Utility functions
const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

const getBubbleSize = (count: number, maxCount: number, minSize: number = 30, maxSize: number = 80): number => {
  const normalized = Math.log10(count) / Math.log10(maxCount)
  return minSize + (maxSize - minSize) * normalized
}

// Tooltip component for bubble hover
const BubbleTooltip = ({ follower }: { follower: Follower }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <img 
          src={follower.profile_image_url} 
          alt={follower.profile_name}
          className="w-8 h-8 rounded-full"
        />
        <div>
          <p className="font-medium text-gray-900 text-sm">{follower.profile_name}</p>
          <p className="text-xs text-gray-500">@{follower.handle}</p>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <p><span className="font-medium">Followers:</span> {formatNumber(follower.followers_count)}</p>
        <p><span className="font-medium">Smart Followers:</span> {formatNumber(follower.smart_followers)}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {follower.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.unknown }}
            >
              {tag.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Sub-component 1: Followers Bubble Map
const FollowersBubbleMap = ({ 
  followers, 
  sortBy, 
  loading 
}: { 
  followers: Follower[]
  sortBy: 'followers_count' | 'smart_followers'
  loading: boolean
}) => {
  const [hoveredFollower, setHoveredFollower] = useState<Follower | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading followers...</p>
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...followers.map(f => sortBy === 'followers_count' ? f.followers_count : f.smart_followers))

  const handleBubbleHover = (e: React.MouseEvent, follower: Follower) => {
    setHoveredFollower(follower)
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }

  const handleBubbleLeave = () => {
    setHoveredFollower(null)
  }

  return (
    <div className="relative">
      <div className="bg-gray-50 rounded-lg p-6 min-h-96 relative overflow-hidden">
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {followers.map((follower, index) => {
            const count = sortBy === 'followers_count' ? follower.followers_count : follower.smart_followers
            const size = getBubbleSize(count, maxCount)
            const primaryTag = follower.tags[0] || 'unknown'
            
            return (
              <div
                key={follower.handle}
                className="relative cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                }}
                onMouseEnter={(e) => handleBubbleHover(e, follower)}
                onMouseLeave={handleBubbleLeave}
              >
                <div 
                  className="w-full h-full rounded-full border-4 shadow-lg flex items-center justify-center overflow-hidden"
                  style={{ 
                    borderColor: TAG_COLORS[primaryTag as keyof typeof TAG_COLORS] || TAG_COLORS.unknown,
                    backgroundColor: 'white'
                  }}
                >
                  <img 
                    src={follower.profile_image_url} 
                    alt={follower.profile_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = `<div class="text-xs font-bold text-gray-600 text-center">${follower.profile_name.substring(0, 3)}</div>`
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1 py-0.5 text-xs font-bold shadow-md border">
                  {formatNumber(count)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredFollower && (
        <div 
          className="fixed z-[1000] pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 15}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translateY(-100%)'
          }}
        >
          <BubbleTooltip follower={hoveredFollower} />
        </div>
      )}
    </div>
  )
}

// Sub-component 2: Tags Distribution Donut Chart
const TagsDistributionChart = ({ 
  followers,
  loading 
}: { 
  followers: Follower[]
  loading: boolean
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading chart...</p>
        </div>
      </div>
    )
  }

  // Count tag occurrences
  const tagCounts: { [key: string]: number } = {}
  followers.forEach(follower => {
    follower.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  // Convert to chart data
  const chartData = Object.entries(tagCounts).map(([tag, count]) => ({
    name: tag.replace('_', ' '),
    value: count,
    color: TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.unknown
  })).sort((a, b) => b.value - a.value)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">Count: {data.value}</p>
          <p className="text-sm text-gray-600">
            {((data.value / followers.length) * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {value} ({entry.payload?.value || 0})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Main component
export default function FollowersOverview({ authorHandle }: { authorHandle: string }) {
  const [followers, setFollowers] = useState<Follower[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'followers_count' | 'smart_followers'>('smart_followers')
  const [limit, setLimit] = useState<20 | 50 | 100>(50)

  // Fetch data
  useEffect(() => {
    const fetchFollowersData = async () => {
      try {
        setLoading(true)
        const sortParam = sortBy === 'followers_count' ? 'followers_count_desc' : 'smart_followers_count_desc'
        const response = await fetch(
          `https://api.cred.buzz/user/author-handle-followers?author_handle=${authorHandle}&sort_by=${sortParam}&limit=${limit}&start=0`
        )
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }
        
        const data: ApiResponse = await response.json()
        setFollowers(data.result.followings)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (authorHandle) {
      fetchFollowersData()
    }
  }, [authorHandle, sortBy, limit])

  // Loading and error states
  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Followers Overview</h3>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Sort By Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSortBy('smart_followers')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'smart_followers' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Smart Followers
              </button>
              <button
                onClick={() => setSortBy('followers_count')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'followers_count' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Total Followers
              </button>
            </div>
          </div>

          {/* Limit Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Show:</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {([20, 50, 100] as const).map((num) => (
                <button
                  key={num}
                  onClick={() => setLimit(num)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    limit === num 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Top {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sub-component 1: Followers Bubble Map */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">
            Top {limit} by {sortBy === 'smart_followers' ? 'Smart Followers' : 'Total Followers'}
          </h4>
          <FollowersBubbleMap 
            followers={followers}
            sortBy={sortBy}
            loading={loading}
          />
        </div>

        {/* Sub-component 2: Tags Distribution Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">
            Tags Distribution
          </h4>
          <TagsDistributionChart 
            followers={followers}
            loading={loading}
          />
        </div>
      </div>

      {/* Summary Stats */}
      {!loading && followers.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(followers.reduce((sum, f) => sum + f.followers_count, 0))}
              </p>
              <p className="text-sm text-gray-600">Total Followers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(followers.reduce((sum, f) => sum + f.smart_followers, 0))}
              </p>
              <p className="text-sm text-gray-600">Smart Followers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {followers.length}
              </p>
              <p className="text-sm text-gray-600">Profiles</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {new Set(followers.flatMap(f => f.tags)).size}
              </p>
              <p className="text-sm text-gray-600">Unique Tags</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 