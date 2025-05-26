"use client"

import type React from "react"

import { LineChart, Line, ResponsiveContainer, Tooltip, type TooltipProps } from "recharts"
import type { ChartDataPoint, UserProfileResponse } from "../types"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useState } from "react"

interface MetricChartProps {
  title: string
  value: string | number
  change: string
  isPositive: boolean
  data: ChartDataPoint[]
  color?: string
  metricType?: "followers" | "smart_followers" | "mindshare"
}

interface HoverTooltipProps {
  x: number
  y: number
  content: string
  visible: boolean
}

function HoverTooltip({ x, y, content, visible }: HoverTooltipProps) {
  if (!visible) return null

  return (
    <div
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs z-50 pointer-events-none"
      style={{
        left: x + 10,
        top: y - 10,
        transform: "translateY(-100%)",
      }}
    >
      {content}
    </div>
  )
}

function CustomTooltip({ active, payload, metricType }: TooltipProps<number, string> & { metricType?: string }) {
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

    if (metricType === "mindshare") {
      // Show mindshare with 4 decimal places
      formattedValue = originalValue.toFixed(4)
    } else if (originalValue >= 1000000) {
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

function MetricChart({ title, value, change, isPositive, data, color = "#22c55e", metricType }: MetricChartProps) {
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
              content={<CustomTooltip metricType={metricType} />}
              cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
              position={{ x: undefined, y: undefined }}
              coordinate={{ x: 0, y: 0 }}
              isAnimationActive={false}
              wrapperStyle={{ pointerEvents: "none" }}
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
  const [tooltip, setTooltip] = useState<HoverTooltipProps>({
    x: 0,
    y: 0,
    content: "",
    visible: false,
  })

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const hours = Array.from({ length: 24 }, (_, i) => i) // 0 to 23

  const getActivityColor = (tweets: number) => {
    if (tweets === 0) return "bg-gray-100"
    if (tweets <= 1) return "bg-green-100"
    if (tweets <= 2) return "bg-green-200"
    if (tweets <= 3) return "bg-green-300"
    return "bg-green-400"
  }

  const handleMouseEnter = (event: React.MouseEvent, day: string, hour: number, tweets: number) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: `${day} ${hour.toString().padStart(2, "0")}:00 UTC - ${tweets} tweets`,
      visible: true,
    })
  }

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }))
  }

  return (
    <div className="card-pastel !bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Activity Heatmap</h3>
        <p className="text-xs text-gray-500">All times in UTC</p>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Hour headers */}
          <div className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 mb-2">
            <div></div>
            {hours.map((hour) => (
              <div key={hour} className="text-center text-xs text-gray-500 flex items-center justify-center h-6">
                {hour}
              </div>
            ))}
          </div>

          {/* Activity grid */}
          {days.map((day) => {
            const dayData = activityData.daily_activity.find((d) => d.day === day)
            return (
              <div key={day} className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 mb-2">
                <div className="text-sm text-gray-600 flex items-center">{day.slice(0, 3)}</div>
                {hours.map((hour) => {
                  const hourData = dayData?.activity.find((a) => a.hour === hour)
                  const tweets = hourData?.avg_tweets || 0
                  return (
                    <div key={hour} className="flex items-center justify-center">
                      <div
                        className={`w-6 h-6 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 ${getActivityColor(tweets)}`}
                        onMouseEnter={(e) => handleMouseEnter(e, day, hour, tweets)}
                        onMouseLeave={handleMouseLeave}
                      />
                    </div>
                  )
                })}
              </div>
            )
          })}

          {/* Legend */}
          <div className="flex items-center justify-center mt-6 gap-4">
            <span className="text-xs text-gray-500">Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-100"></div>
              <div className="w-3 h-3 rounded-full bg-green-100"></div>
              <div className="w-3 h-3 rounded-full bg-green-200"></div>
              <div className="w-3 h-3 rounded-full bg-green-300"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <span className="text-xs text-gray-500">More</span>
          </div>
        </div>
      </div>

      <HoverTooltip {...tooltip} />
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
          metricType="followers"
        />

        <MetricChart
          title="Smart Followers"
          value={currentData.smart_followers_count.toLocaleString()}
          change={`${smartFollowersChange >= 0 ? "+" : ""}${smartFollowersChange.toFixed(1)}% (30D)`}
          isPositive={smartFollowersChange >= 0}
          data={smartFollowersData}
          color="#22c55e"
          metricType="smart_followers"
        />

        <MetricChart
          title="Mindshare Score"
          value={currentData.mindshare.toFixed(1)}
          change={`${mindshareChange >= 0 ? "+" : ""}${mindshareChange.toFixed(1)}% (30D)`}
          isPositive={mindshareChange >= 0}
          data={mindshareData}
          color="#f59e0b"
          metricType="mindshare"
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
