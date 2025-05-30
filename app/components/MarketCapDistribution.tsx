"use client"

import { useState, useEffect, useRef } from "react"
import * as d3 from "d3"

// Type definitions
interface Token {
  symbol: string
  marketcap: number
  icon?: string
}

interface Bucket {
  bucket: string
  token_count: number
  tokens: Token[]
}

interface MarketCapData {
  overall_avg_marketcap: number
  overall_median_marketcap: number
  buckets: Bucket[]
}

interface ApiResponse {
  result: MarketCapData
  message: string
}

interface TokenData {
  id: string
  symbol: string
  name: string
  market_cap_usd: number | null
  current_price_usd: number | null
  profile_image_url: string | null
  sector?: string
}

// Market cap segments configuration
const MARKET_CAP_SEGMENTS = [
  { 
    key: 'micro', 
    label: 'Micro-Caps', 
    range: '< $10M', 
    color: '#EF4444',
    min: 0,
    max: 10_000_000
  },
  { 
    key: 'low', 
    label: 'Low-Caps', 
    range: '$10M - $50M', 
    color: '#F97316',
    min: 10_000_000,
    max: 50_000_000
  },
  { 
    key: 'mid', 
    label: 'Mid-Caps', 
    range: '$50M - $250M', 
    color: '#EAB308',
    min: 50_000_000,
    max: 250_000_000
  },
  { 
    key: 'large', 
    label: 'Large-Caps', 
    range: '$250M - $1B', 
    color: '#22C55E',
    min: 250_000_000,
    max: 1_000_000_000
  },
  { 
    key: 'blue', 
    label: 'Blue-Chips', 
    range: '>$1B', 
    color: '#06B6D4',
    min: 1_000_000_000,
    max: Infinity
  }
]

// Time period options
const TIME_PERIODS = [
  { value: '1day', label: '24H' },
  { value: '7day', label: '7D' },
  { value: '30day', label: '30D' }
]

// Constants
const CHART_WIDTH = 850
const CHART_HEIGHT = 180
const ICON_SIZE = 24
const ICON_SPACING = 2
const MAX_ICONS_PER_SEGMENT = 36
const MAX_ROWS_PER_SEGMENT = 7
const COLUMNS_PER_SEGMENT = 5
const SEGMENT_HEIGHT = 3
const BAR_Y_POSITION = 140
const VERTICAL_STACK_OFFSET = 16

// Utility functions
const formatMarketCap = (value: number) => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

// Retry function for API calls
const fetchWithRetry = async <T,>(url: string, maxRetries = 3): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  throw new Error('Max retries reached')
}

export default function MarketCapDistribution({ authorHandle }: { authorHandle: string }) {
  const [marketCapData, setMarketCapData] = useState<MarketCapData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [timePeriod, setTimePeriod] = useState<string>('30day')
  const svgRef = useRef<SVGSVGElement>(null)

  // Fetch data
  const fetchData = async (interval: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await fetchWithRetry<ApiResponse>(
        `https://api.cred.buzz/user/first-call-marketcap?author_handle=${authorHandle}&interval=${interval}`
      )

      // Handle case where API returns successful response but no data
      if (!data.result) {
        setMarketCapData(null)
        setError(data.message || 'No market cap data found for this author')
        return
      }

      setMarketCapData(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authorHandle) {
      fetchData(timePeriod)
    }
  }, [authorHandle, timePeriod])

  // Handle time period change
  const handleTimePeriodChange = (period: string) => {
    setTimePeriod(period)
  }

  // D3 Visualization
  useEffect(() => {
    if (!svgRef.current || !marketCapData || loading) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    // Process data
    const allTokens: Token[] = []
    marketCapData.buckets.forEach(bucket => {
      bucket.tokens.forEach(token => {
        allTokens.push(token)
      })
    })

    // Group tokens by segments
    const segmentTokens = MARKET_CAP_SEGMENTS.map(() => [] as Token[])
    allTokens.forEach(token => {
      const segmentIndex = MARKET_CAP_SEGMENTS.findIndex(segment => 
        token.marketcap >= segment.min && token.marketcap < segment.max
      )
      if (segmentIndex !== -1) {
        segmentTokens[segmentIndex].push(token)
      } else {
        segmentTokens[segmentTokens.length - 1].push(token)
      }
    })

    // Create segments data
    const segmentWidth = CHART_WIDTH / MARKET_CAP_SEGMENTS.length
    const segmentData = MARKET_CAP_SEGMENTS.map((segment, index) => ({
      ...segment,
      tokens: segmentTokens[index].sort((a, b) => b.marketcap - a.marketcap).slice(0, MAX_ICONS_PER_SEGMENT),
      allTokens: segmentTokens[index],
      x: index * segmentWidth,
      width: segmentWidth
    }))

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "market-cap-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#1f2937")
      .style("border", "1px solid #374151")
      .style("color", "white")
      .style("padding", "12px 16px")
      .style("border-radius", "12px")
      .style("font-size", "14px")
      .style("pointer-events", "none")
      .style("z-index", "9999")
      .style("box-shadow", "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)")
      .style("backdrop-filter", "blur(8px)")

    // Create main group
    const g = svg.append("g")

    // Create segmented bar
    const segments = g.selectAll(".segment")
      .data(segmentData)
      .enter().append("rect")
      .attr("class", "segment")
      .attr("x", d => d.x)
      .attr("y", BAR_Y_POSITION)
      .attr("width", d => d.width)
      .attr("height", SEGMENT_HEIGHT)
      .attr("fill", d => d.color)
      .attr("rx", (d, i) => {
        if (i === 0 || i === segmentData.length - 1) return 6
        return 0
      })

    // Create token icons
    segmentData.forEach((segment, segmentIndex) => {
      segment.tokens.forEach((token, tokenIndex) => {
        const row = Math.floor(tokenIndex / COLUMNS_PER_SEGMENT)
        const col = tokenIndex % COLUMNS_PER_SEGMENT
        
        if (row >= MAX_ROWS_PER_SEGMENT) return

        const startX = segment.x + 5
        const availableWidth = segment.width - 20
        const totalRowWidth = COLUMNS_PER_SEGMENT * ICON_SIZE + (COLUMNS_PER_SEGMENT - 1) * ICON_SPACING
        const rowStartX = startX + (availableWidth - totalRowWidth) / 2
        
        const x = rowStartX + col * (ICON_SIZE + ICON_SPACING)
        const y = BAR_Y_POSITION - 25 - (row * VERTICAL_STACK_OFFSET)

        // Create icon group with higher z-index for front rows
        const iconGroup = g.append("g")
          .attr("class", "token-icon")
          .attr("transform", `translate(${x}, ${y})`)
          .style("cursor", "pointer")
          .style("z-index", MAX_ROWS_PER_SEGMENT - row) // Front rows have higher z-index

        // Add background circle
        iconGroup.append("circle")
          .attr("cx", ICON_SIZE / 2)
          .attr("cy", ICON_SIZE / 2)
          .attr("r", ICON_SIZE / 2)
          .attr("fill", token.icon ? "transparent" : segment.color)
          .attr("stroke", "rgba(255,255,255,0.9)")
          .attr("stroke-width", 1.5)
          .style("filter", `drop-shadow(0 ${1 + row * 1.5}px ${2 + row * 1.5}px rgba(0,0,0,${0.12 + row * 0.03}))`)

        // Add token icon or symbol
        if (token.icon) {
          iconGroup.append("image")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", ICON_SIZE)
            .attr("height", ICON_SIZE)
            .attr("href", token.icon)
            .attr("clip-path", "circle(50% at 50% 50%)")
        } else {
          iconGroup.append("text")
            .attr("x", ICON_SIZE / 2)
            .attr("y", ICON_SIZE / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "white")
            .attr("font-size", "10px")
            .attr("font-weight", "bold")
            .text(token.symbol.substring(0, 2).toUpperCase())
        }

        // Add hover effects
        iconGroup
          .on("mouseenter", function(event) {
            d3.select(this).select("circle")
              .transition()
              .duration(200)
              .attr("r", ICON_SIZE / 2 * 1.1)
              .attr("stroke", segment.color)
              .attr("stroke-width", 3)
              .style("filter", `drop-shadow(0 0 20px ${segment.color}80)`)

            tooltip.style("visibility", "visible")
              .html(`
                <div style="font-weight: bold; color: white; margin-bottom: 4px;">${token.symbol.toUpperCase()}</div>
                <div style="color: #d1d5db;">Market Cap: <span style="color: #10b981; font-weight: 600;">${formatMarketCap(token.marketcap)}</span></div>
              `)
          })
          .on("mousemove", function(event) {
            tooltip
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 70) + "px")
          })
          .on("mouseleave", function() {
            d3.select(this).select("circle")
              .transition()
              .duration(200)
              .attr("r", ICON_SIZE / 2)
              .attr("stroke", "rgba(255,255,255,0.8)")
              .attr("stroke-width", 2)
              .style("filter", "drop-shadow(0 2px 8px rgba(0,0,0,0.1))")

            tooltip.style("visibility", "hidden")
          })
      })

      // Add overflow indicator if needed
      const overflowCount = segment.allTokens.length - MAX_ICONS_PER_SEGMENT
      if (overflowCount > 0) {
        const overflowX = segment.x + segment.width - 20
        const overflowY = BAR_Y_POSITION - 50

        const overflowGroup = g.append("g")
          .attr("transform", `translate(${overflowX}, ${overflowY})`)

        overflowGroup.append("circle")
          .attr("cx", 10)
          .attr("cy", 10)
          .attr("r", 10)
          .attr("fill", "#4b5563")
          .style("filter", "drop-shadow(0 1px 4px rgba(0,0,0,0.15))")

        overflowGroup.append("text")
          .attr("x", 10)
          .attr("y", 10)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("fill", "white")
          .attr("font-size", "9px")
          .attr("font-weight", "bold")
          .text(`+${overflowCount}`)
          .append("title")
          .text(`${overflowCount} more tokens in this segment`)
      }
    })

    // Add labels
    const labelGroup = g.append("g")
      .attr("class", "labels")
      .attr("transform", `translate(0, ${BAR_Y_POSITION + 20})`)

    segmentData.forEach((segment, index) => {
      const labelX = segment.x + segment.width / 2

      labelGroup.append("text")
        .attr("x", labelX)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .attr("font-weight", "600")
        .attr("fill", "#1f2937")
        .text(segment.label)

      labelGroup.append("text")
        .attr("x", labelX)
        .attr("y", 14)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("fill", "#6b7280")
        .text(segment.range)
    })

    // Cleanup function
    return () => {
      tooltip.remove()
    }
  }, [marketCapData, loading])

  // Loading and error states
  if (loading) {
    return (
      <div className="card-pastel bg-white p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">First Call Market Cap Distribution</h3>
          
          {/* Time Period Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {TIME_PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => handleTimePeriodChange(period.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  timePeriod === period.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center space-x-3 py-12">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
          <div className="text-base text-gray-800 dark:text-gray-100">Loading market cap distribution...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-pastel bg-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">First Call Market Cap Distribution</h3>
        
        {/* Time Period Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {TIME_PERIODS.map((period) => (
            <button
              key={period.value}
              onClick={() => handleTimePeriodChange(period.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                timePeriod === period.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-500 text-base font-semibold mb-2">Error Loading Data</div>
          <div className="text-gray-600 dark:text-gray-300 mb-3 text-sm">{error}</div>
          <button
            onClick={() => fetchData(timePeriod)}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* No Data State */}
      {!error && !marketCapData && (
        <div className="text-center py-12">
          <div className="text-gray-600 dark:text-gray-300 text-sm">No market cap data available</div>
        </div>
      )}

      {/* Stats and Chart - Only show when we have data */}
      {marketCapData && !error && (
        <>
          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-3 text-sm mb-4">
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Avg. call market cap:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold ml-2">{formatMarketCap(marketCapData.overall_avg_marketcap)}</span>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Median call market cap:</span>
              <span className="text-green-600 dark:text-green-400 font-bold ml-2">{formatMarketCap(marketCapData.overall_median_marketcap)}</span>
            </div>
          </div>

          {/* D3 Chart */}
          <div className="w-full overflow-x-auto">
            <svg 
              ref={svgRef} 
              width={CHART_WIDTH} 
              height={CHART_HEIGHT}
              className="w-full"
              style={{ minHeight: "180px" }}
            />
          </div>
        </>
      )}
    </div>
  )
}
