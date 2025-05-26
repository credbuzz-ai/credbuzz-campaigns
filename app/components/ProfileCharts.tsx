"use client"

import { LineChart, Line, ResponsiveContainer, Tooltip, type TooltipProps } from "recharts"
import type { ChartDataPoint, UserProfileResponse } from "../types"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricChartProps {
  title: string
  value: string | number
  change: string
  isPositive: boolean
  data: ChartDataPoint[]
  color?: string
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload as ChartDataPoint
    const date = new Date(data.date)
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })

    // Format the original value appropriately
    const originalValue = data.originalValue
    let formattedValue: string

    if (originalValue >= 1000000) {
      formattedValue = (originalValue / 1000000).toFixed(1) + "M"
    } else if (originalValue >= 1000) {
      formattedValue = (originalValue / 1000).toFixed(1) + "K"
    } else if (originalValue % 1 === 0) {
      formattedValue = originalValue.toLocaleString()
    } else {
      formattedValue = originalValue.toFixed(1)
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
        <p className="text-sm font-medium text-gray-900">{formattedValue}</p>
        <p className="text-xs text-gray-500">{formattedDate}</p>
      </div>
    )
  }

  return null
}

function MetricChart({ title, value, change, isPositive, data, color = "#22c55e" }: MetricChartProps) {
  // Scale the data to make trends more visible
  const values = data.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue

  // If the range is too small, create artificial scaling for visibility
  const scaledData: ChartDataPoint[] =
    range === 0
      ? data.map((d, i) => ({
          value: 50 + Math.sin(i * 0.5) * 20, // Create some variation if data is flat
          originalValue: d.originalValue,
          date: d.date,
        }))
      : data.map((d) => ({
          value: ((d.value - minValue) / range) * 100, // Scale to 0-100 for better visibility
          originalValue: d.originalValue,
          date: d.date,
        }))

  return (
    <div className="card-pastel !bg-white p-6">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          <div
            className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}
          >
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {change}
          </div>
        </div>
      </div>
      <div className="h-16 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={scaledData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
              position={{ x: 0, y: 0 }}
              allowEscapeViewBox={{ x: true, y: true }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={isPositive ? color : "#ef4444"}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                stroke: isPositive ? color : "#ef4444",
                strokeWidth: 2,
                fill: "white",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function ActivityHeatmap({ activityData }: { activityData: UserProfileResponse["result"]["activity_data"] }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getActivityColor = (tweets: number) => {
    if (tweets === 0) return "bg-gray-100"
    if (tweets <= 1) return "bg-green-100"
    if (tweets <= 2) return "bg-green-200"
    if (tweets <= 3) return "bg-green-300"
    return "bg-green-400"
  }

  return (
    <div className="card-pastel !bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Heatmap</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex mb-2">
            <div className="w-12"></div>
            {hours
              .filter((_, i) => i % 4 === 0)
              .map((hour) => (
                <div key={hour} className="flex-1 text-center text-xs text-gray-500">
                  {hour}
                </div>
              ))}
          </div>
          {days.map((day) => {
            const dayData = activityData.daily_activity.find((d) => d.day.startsWith(day))
            return (
              <div key={day} className="flex items-center mb-1">
                <div className="w-12 text-xs text-gray-600">{day}</div>
                <div className="flex-1 flex">
                  {hours.map((hour) => {
                    const hourData = dayData?.activity.find((a) => a.hour === hour)
                    return (
                      <div
                        key={hour}
                        className={`flex-1 aspect-square m-0.5 rounded-sm ${getActivityColor(hourData?.avg_tweets || 0)}`}
                        title={`${day} ${hour}:00 - ${hourData?.avg_tweets || 0} tweets`}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function ProfileCharts({
  chartData,
  activityData,
}: {
  chartData: ChartDataPoint[]
  activityData: UserProfileResponse["result"]["activity_data"]
}) {
  if (!chartData.length) return null

  // Get last 30 data points (or all if less than 30)
  const last30Days = chartData.slice(-30)

  // Generate chart data for each metric with original values and dates
  const followersData: ChartDataPoint[] = last30Days.map((point) => ({
    value: point.followers_count,
    originalValue: point.followers_count,
    date: point.date,
  }))
  const smartFollowersData: ChartDataPoint[] = last30Days.map((point) => ({
    value: point.smart_followers_count,
    originalValue: point.smart_followers_count,
    date: point.date,
  }))
  const mindshareData: ChartDataPoint[] = last30Days.map((point) => ({
    value: point.mindshare,
    originalValue: point.mindshare,
    date: point.date,
  }))

  // Calculate 30-day changes (using last vs 30 days ago)
  const followersChange =
    last30Days.length > 1
      ? ((last30Days[last30Days.length - 1].followers_count - last30Days[0].followers_count) /
          last30Days[0].followers_count) *
        100
      : 0

  const smartFollowersChange =
    last30Days.length > 1
      ? ((last30Days[last30Days.length - 1].smart_followers_count - last30Days[0].smart_followers_count) /
          last30Days[0].smart_followers_count) *
        100
      : 0

  const mindshareChange =
    last30Days.length > 1
      ? ((last30Days[last30Days.length - 1].mindshare - last30Days[0].mindshare) / last30Days[0].mindshare) * 100
      : 0

  const currentData = last30Days[last30Days.length - 1]

  return (
    <div className="space-y-6">
      {/* Metric Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricChart
          title="Total Followers"
          value={currentData.followers_count.toLocaleString()}
          change={`${followersChange >= 0 ? "+" : ""}${followersChange.toFixed(1)}% (30D)`}
          isPositive={followersChange >= 0}
          data={followersData}
          color="#3b82f6"
        />

        <MetricChart
          title="Smart Followers"
          value={currentData.smart_followers_count.toLocaleString()}
          change={`${smartFollowersChange >= 0 ? "+" : ""}${smartFollowersChange.toFixed(1)}% (30D)`}
          isPositive={smartFollowersChange >= 0}
          data={smartFollowersData}
          color="#22c55e"
        />

        <MetricChart
          title="Mindshare Score"
          value={currentData.mindshare.toFixed(1)}
          change={`${mindshareChange >= 0 ? "+" : ""}${mindshareChange.toFixed(1)}% (30D)`}
          isPositive={mindshareChange >= 0}
          data={mindshareData}
          color="#f59e0b"
        />
      </div>

      {/* Activity Heatmap */}
      {activityData.daily_activity.length > 0 && <ActivityHeatmap activityData={activityData} />}
    </div>
  )
}

// Keep the old exports for backward compatibility but mark as deprecated
export function GrowthChart({ data }: { data: ChartDataPoint[] }) {
  return null // Deprecated - use ProfileCharts instead
}

export function ActivityChart({ activityData }: { activityData: UserProfileResponse["result"]["activity_data"] }) {
  return <ActivityHeatmap activityData={activityData} />
}
