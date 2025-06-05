"use client"

import { useState, useEffect, useRef } from "react"
import * as d3 from "d3"
import { API_BASE_URL } from '../../lib/constants'
import { TrendingUp } from "lucide-react"

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
        `${API_BASE_URL}/user/first-call-marketcap?author_handle=${authorHandle}&interval=${interval}`
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
      tokens: segmentTokens[index].sort((a, b) => a.marketcap - b.marketcap).slice(0, MAX_ICONS_PER_SEGMENT),
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

    // Define gradients for each segment
    const defs = svg.append("defs")
    
    segmentData.forEach((segment, index) => {
      const gradient = defs.append("linearGradient")
        .attr("id", `gradient-${index}`)
        .attr("x1", "0%")
        .attr("y1", "100%") // Start from bottom
        .attr("x2", "0%")
        .attr("y2", "0%") // End at top
      
      // Darker color at bottom (base)
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", segment.color)
        .attr("stop-opacity", "0.3")
      
      // Medium opacity in middle
      gradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", segment.color)
        .attr("stop-opacity", "0.15")
      
      // Fade to transparent at top
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", segment.color)
        .attr("stop-opacity", "0")
    })

    // Create background rectangles with gradient
    const backgroundHeight = BAR_Y_POSITION - 20 // Extend from slightly above the bar to top of chart area
    const backgrounds = g.selectAll(".segment-background")
      .data(segmentData)
      .enter().append("rect")
      .attr("class", "segment-background")
      .attr("x", d => d.x)
      .attr("y", 20) // Start from top of chart area
      .attr("width", d => d.width)
      .attr("height", backgroundHeight)
      .attr("fill", (d, i) => `url(#gradient-${i})`)

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

  // Loading state
  if (loading) {
    return (
      <div className="card-trendsage">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00D992]" />
            <h3 className="text-lg font-semibold text-gray-100">Market Cap Distribution</h3>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D992] mx-auto mb-3"></div>
            <p className="text-gray-300 text-sm">Loading market cap data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="card-trendsage">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00D992]" />
            <h3 className="text-lg font-semibold text-gray-100">Market Cap Distribution</h3>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => fetchData(timePeriod)}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // No data state
  if (!marketCapData) {
    return (
      <div className="card-trendsage">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00D992]" />
            <h3 className="text-lg font-semibold text-gray-100">Market Cap Distribution</h3>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">No market cap data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-trendsage">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00D992]" />
          <h3 className="text-lg font-semibold text-gray-100">Market Cap Distribution</h3>
        </div>
        
        {/* Time Period Filter */}
        <div className="flex bg-gray-700 rounded-lg p-1">
          {TIME_PERIODS.map(period => (
            <button
              key={period.value}
              onClick={() => handleTimePeriodChange(period.value)}
              className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                timePeriod === period.value
                  ? 'bg-[#00D992] text-gray-900'
                  : 'text-gray-300 hover:text-[#00D992] hover:bg-gray-600'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Market Cap Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
          <div className="text-sm text-gray-400 mb-1">Average Market Cap</div>
          <div className="text-lg font-semibold text-[#00D992]">
            {formatMarketCap(marketCapData.overall_avg_marketcap)}
          </div>
        </div>
        <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
          <div className="text-sm text-gray-400 mb-1">Median Market Cap</div>
          <div className="text-lg font-semibold text-[#00D992]">
            {formatMarketCap(marketCapData.overall_median_marketcap)}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
        <svg 
          ref={svgRef} 
          width={CHART_WIDTH} 
          height={CHART_HEIGHT}
          className="w-full h-auto"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {MARKET_CAP_SEGMENTS.map(segment => (
          <div key={segment.key} className="flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: segment.color }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-gray-200 truncate">{segment.label}</div>
              <div className="text-xs text-gray-400">{segment.range}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
