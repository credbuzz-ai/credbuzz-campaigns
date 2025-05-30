"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import * as d3 from "d3"

import { LineChart, Line, ResponsiveContainer, Tooltip, type TooltipProps } from "recharts"
import type { ChartDataPoint, UserProfileResponse } from "../types"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useState } from "react"
import TokenOverview from "./TokenOverview"

interface MetricChartProps {
  title: string
  value: string | number
  change: string
  isPositive: boolean
  data: ChartDataPoint[]
  color?: string
  metricType?: "followers" | "smart_followers" | "mindshare"
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
    const originalValue = data.originalValue ?? 0; // Default to 0 if undefined
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
  const values = data.map((d) => d.value ?? 0); // Default to 0 if undefined
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue

  // If the range is too small, create artificial scaling for visibility
  const scaledData: ChartDataPoint[] =
    range === 0
      ? data.map((d, i) => ({
          ...d, // Spread existing properties
          value: 50 + Math.sin(i * 0.5) * 20, // Create some variation if data is flat
          originalValue: d.originalValue ?? 0,
        }))
      : data.map((d) => ({
          ...d, // Spread existing properties
          value: range === 0 ? 50 : (((d.value ?? 0) - minValue) / range) * 100,
          originalValue: d.originalValue ?? 0,
        }))

  return (
    <div className="card-pastel !bg-white p-4 rounded-lg shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <div
            className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        </div>
      </div>
      <div className="h-12 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={scaledData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
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
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !activityData.daily_activity.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const hours = Array.from({ length: 24 }, (_, i) => i)
    
    // Prepare data
    const heatmapData: Array<{day: string, hour: number, tweets: number, dayIndex: number}> = []
    days.forEach((day, dayIndex) => {
      const dayData = activityData.daily_activity.find((d) => d.day === day)
      hours.forEach((hour) => {
        const hourData = dayData?.activity.find((a) => a.hour === hour)
        const tweets = hourData?.avg_tweets || 0
        heatmapData.push({ day, hour, tweets, dayIndex })
      })
    })

    // Dimensions
    const margin = { top: 40, right: 20, bottom: 25, left: 60 }
    const cellSize = 31
    const width = 24 * cellSize + margin.left + margin.right
    const height = 7 * cellSize + margin.top + margin.bottom

    svg.attr("width", width).attr("height", height)

    // Color scale
    const maxTweets = d3.max(heatmapData, d => d.tweets) || 4
    const colorScale = d3.scaleSequential(d3.interpolateGreens)
      .domain([0, maxTweets])

    // Create main group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "heatmap-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.2)")

    // Add hour labels (top)
    g.selectAll(".hour-label")
      .data(hours.filter(h => h % 3 === 0)) // Show every 3rd hour
      .enter().append("text")
      .attr("class", "hour-label")
      .attr("x", d => d * cellSize + cellSize / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#6b7280")
      .text(d => `${d.toString().padStart(2, '0')}:00`)

    // Add day labels (left)
    g.selectAll(".day-label")
      .data(days)
      .enter().append("text")
      .attr("class", "day-label")
      .attr("x", -15)
      .attr("y", (d, i) => i * cellSize + cellSize / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#6b7280")
      .text(d => d.substring(0, 3)) // Shortened day names

    // Create heatmap cells
    const cells = g.selectAll(".cell")
      .data(heatmapData)
      .enter().append("rect")
      .attr("class", "cell")
      .attr("x", d => d.hour * cellSize + 1)
      .attr("y", d => d.dayIndex * cellSize + 1)
      .attr("width", cellSize - 2)
      .attr("height", cellSize - 2)
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("fill", d => d.tweets === 0 ? "#f3f4f6" : colorScale(d.tweets))
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")

    // Add hover effects
    cells
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("stroke", "#374151")
          .attr("stroke-width", 2)
          .style("filter", "brightness(1.1)")

        tooltip.style("visibility", "visible")
          .html(`
            <div style="font-weight: 600; margin-bottom: 4px;">${d.day}</div>
            <div style="margin-bottom: 2px;">${d.hour.toString().padStart(2, '0')}:00 UTC</div>
            <div style="color: #a3e635;">${d.tweets.toFixed(1)} avg tweets</div>
          `)
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("stroke", "white")
          .attr("stroke-width", 1)
          .style("filter", "none")

        tooltip.style("visibility", "hidden")
      })

    // Add entrance animation
    cells
      .style("opacity", 0)
      .transition()
      .delay((d, i) => i * 3)
      .duration(400)
      .style("opacity", 1)

    // Add legend
    const legendWidth = 250
    const legendHeight = 12
    const legendMargin = 10

    const legendGroup = svg.append("g")
      .attr("transform", `translate(${width - legendWidth - margin.right}, ${height - margin.bottom + legendMargin})`)

    // Create legend gradient
    const defs = svg.append("defs")
    const gradient = defs.append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%")

    gradient.selectAll("stop")
      .data(d3.range(0, 1.1, 0.1))
      .enter().append("stop")
      .attr("offset", d => `${d * 100}%`)
      .attr("stop-color", d => colorScale(d * maxTweets))

    // Legend rectangle
    legendGroup.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("fill", "url(#legend-gradient)")
      .attr("rx", 2)

    // Legend labels
    legendGroup.append("text")
      .attr("x", 0)
      .attr("y", legendHeight + 15)
      .attr("text-anchor", "start")
      .attr("font-size", "10px")
      .attr("fill", "#6b7280")
      .text("Less")

    legendGroup.append("text")
      .attr("x", legendWidth)
      .attr("y", legendHeight + 15)
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", "#6b7280")
      .text("More")

    // Cleanup function
    return () => {
      tooltip.remove()
    }
  }, [activityData])

  return (
    <div className="card-pastel !bg-white p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Activity Heatmap</h3>
        <p className="text-xs text-gray-500">All times in UTC</p>
      </div>

      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full" style={{ minHeight: "300px" }}></svg>
      </div>
    </div>
  )
}

export function ProfileCharts({
  chartData,
  activityData,
  authorHandle,
}: {
  chartData: ChartDataPoint[]
  activityData: UserProfileResponse["result"]["activity_data"]
  authorHandle: string
}) {
  if (!chartData.length) return null

  // Get last 30 data points (or all if less than 30)
  const last30Days = chartData.slice(-30)

  // Generate chart data for each metric with original values and dates
  const followersData: ChartDataPoint[] = last30Days.map((point) => ({
    ...point, // Spread existing properties
    value: point.followers_count,
    originalValue: point.followers_count,
  }))
  const smartFollowersData: ChartDataPoint[] = last30Days.map((point) => ({
    ...point, // Spread existing properties
    value: point.smart_followers_count,
    originalValue: point.smart_followers_count,
  }))
  const mindshareData: ChartDataPoint[] = last30Days.map((point) => ({
    ...point, // Spread existing properties
    value: point.mindshare,
    originalValue: point.mindshare,
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

      {/* Token Overview */}
      <TokenOverview authorHandle={authorHandle} />

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
