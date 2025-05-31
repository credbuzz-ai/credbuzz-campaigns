"use client"

import { useState, useEffect, useRef } from "react"
import { Coins, TrendingUp, Hash, Calendar, DollarSign } from "lucide-react"
import * as d3 from "d3"
import type { TokenOverviewResponse, TokenData } from "../types"
import { API_BASE_URL } from '../../lib/constants'

interface TokenOverviewProps {
  authorHandle: string
}

type Interval = "1day" | "7day" | "30day"

const intervalOptions = [
  { value: "1day" as Interval, label: "24H" },
  { value: "7day" as Interval, label: "7D" },
  { value: "30day" as Interval, label: "30D" },
]

const narrativeColors: Record<string, string> = {
  ai: "#3B82F6",
  defi: "#10B981",
  meme: "#EC4899",
  gamefi: "#8B5CF6",
  nft: "#6366F1",
  rwa: "#F97316",
  dao: "#EAB308",
  "vc-backed": "#6B7280",
  launchpad: "#06B6D4",
  privacy: "#EF4444",
  "yield-farm": "#84CC16",
  dex: "#059669",
  socialfi: "#7C3AED",
  metaverse: "#C026D3",
  zkproof: "#64748B",
}

interface HierarchyNode {
  name: string
  children?: HierarchyNode[]
  value?: number
  narrative?: string
  symbol?: string
  icon?: string | null
  volume_24hr?: number
  first_tweet_time?: string
  total_tweets?: number
}

export default function TokenOverview({ authorHandle }: TokenOverviewProps) {
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3
  const RETRY_DELAY = 1000
  const [data, setData] = useState<TokenOverviewResponse["result"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [interval, setInterval] = useState<Interval>("7day")
  const [selectedNarrative, setSelectedNarrative] = useState<string | null>(null)
  const [hoveredToken, setHoveredToken] = useState<string | null>(null)
  const [showAllLegends, setShowAllLegends] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const fetchTokenData = async (attempt = 0) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/author-token-overview?author_handle=${authorHandle}&interval=${interval}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        },
      )

      if (response.ok) {
        const result = (await response.json()) as TokenOverviewResponse
        if (result.result) {
          setData(result.result)
          setRetryCount(0)
        } else {
          throw new Error("Invalid response format")
        }
      } else {
        throw new Error(`API Error: ${response.status}`)
      }
    } catch (error) {
      console.error(`Failed to fetch token data (attempt ${attempt + 1}):`, error)

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, attempt)
        setRetryCount(attempt + 1)
        setError(`Retrying... (${attempt + 1}/${MAX_RETRIES})`)

        setTimeout(() => {
          fetchTokenData(attempt + 1)
        }, delay)
        return
      }

      setError("Failed to fetch token data")
      setRetryCount(0)
      // Fallback data for demo
      setData({
        unique_token_count: 14,
        total_mentions: 309,
        most_mentioned_token: {
          symbol: "btc",
          mention_count: 95,
        },
        narrative_breakdown: {
          ai: 107,
          launchpad: 22,
          "vc-backed": 79,
          dao: 69,
          privacy: 16,
          meme: 30,
          "yield-farm": 48,
          defi: 108,
          dex: 38,
          rwa: 78,
          socialfi: 6,
          gamefi: 72,
          nft: 8,
          metaverse: 8,
          zkproof: 15,
        },
        tokens: [
          {
            symbol: "btc",
            total_tweets: 95,
            first_tweet_time: "2023-12-05T22:43:25",
            last_tweet_time: "2025-05-22T05:55:52",
            icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
            narratives: [],
            volume_24hr: 46490497024,
          },
          {
            symbol: "eth",
            total_tweets: 64,
            first_tweet_time: "2024-10-18T20:26:36",
            last_tweet_time: "2025-05-25T09:15:13",
            icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png",
            narratives: ["rwa", "ai", "defi", "gamefi"],
            volume_24hr: 8318013.5,
          },
          {
            symbol: "wld",
            total_tweets: 15,
            first_tweet_time: "2024-10-18T17:47:30",
            last_tweet_time: "2025-05-24T10:45:26",
            icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/13502.png",
            narratives: ["vc-backed", "ai", "zkproof", "dao"],
            volume_24hr: 286131360,
          },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  const prepareHierarchyData = (): HierarchyNode => {
    if (!data) return { name: "root", children: [] }

    // Create a map to store narrative nodes
    const narrativeMap = new Map<string, HierarchyNode>()
    
    // Initialize narrative nodes from narrative_breakdown
    Object.entries(data.narrative_breakdown || {}).forEach(([narrative, count]) => {
      // If a narrative is selected, only include that narrative
      if (selectedNarrative && narrative !== selectedNarrative) return
      
      narrativeMap.set(narrative, {
        name: narrative,
        narrative: narrative,
        value: 0, // Will be calculated from children
        children: []
      })
    })

    // Add tokens to their respective narratives
    data.tokens?.forEach((token: TokenData) => {
      if (token.narratives.length === 0) {
        // If token has no narratives, create an "other" category
        if (!selectedNarrative || selectedNarrative === "other") {
          if (!narrativeMap.has("other")) {
            narrativeMap.set("other", {
              name: "other",
              narrative: "other",
              value: 0,
              children: []
            })
          }
          narrativeMap.get("other")!.children!.push({
            name: token.symbol,
            symbol: token.symbol,
            value: token.total_tweets,
            icon: token.icon,
            volume_24hr: token.volume_24hr,
            first_tweet_time: token.first_tweet_time,
            total_tweets: token.total_tweets
          })
        }
      } else {
        // Add token to each of its narratives
        token.narratives.forEach((narrative: string) => {
          // Only include tokens that match the selected narrative (if any)
          if (selectedNarrative && narrative !== selectedNarrative) return
          
          if (narrativeMap.has(narrative)) {
            narrativeMap.get(narrative)!.children!.push({
              name: token.symbol,
              symbol: token.symbol,
              // When filtering to a specific narrative, show full mention count
              // When showing all narratives, distribute mentions across narratives
              value: selectedNarrative ? token.total_tweets : Math.ceil(token.total_tweets / token.narratives.length),
              icon: token.icon,
              volume_24hr: token.volume_24hr,
              first_tweet_time: token.first_tweet_time,
              total_tweets: token.total_tweets
            })
          }
        })
      }
    })

    // Calculate narrative values from children and filter out empty narratives
    const narratives = Array.from(narrativeMap.values())
      .filter(narrative => narrative.children!.length > 0)
      .map(narrative => ({
        ...narrative,
        value: narrative.children!.reduce((sum, child) => sum + (child.value || 0), 0)
      }))

    return {
      name: "root",
      children: narratives
    }
  }

  const renderCircularPacking = () => {
    if (!data || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 600
    const height = 400
    const margin = 10

    svg.attr("width", width).attr("height", height)

    const hierarchyData = prepareHierarchyData()
    
    // Create hierarchy and calculate layout
    const root = d3.hierarchy(hierarchyData)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0))

    const pack = d3.pack<HierarchyNode>()
      .size([width - margin, height - margin])
      .padding(1)

    const packedRoot = pack(root)

    // Create main container group with smaller margin
    const container = svg.append("g")
      .attr("transform", `translate(${margin/2}, ${margin/2})`)

    // Create zoomable group
    const zoomGroup = container.append("g")
      .attr("class", "zoom-group")

    // Create zoom behavior with better scale range for larger bubbles
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => {
        zoomGroup.attr("transform", event.transform)
      })

    // Apply zoom behavior to SVG
    svg.call(zoom)

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000")

    // Draw narrative circles (parent nodes) - now in zoomGroup
    const narrativeNodes = zoomGroup.selectAll(".narrative")
      .data(packedRoot.children || [])
      .enter().append("g")
      .attr("class", "narrative")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)

    narrativeNodes.append("circle")
      .attr("r", d => d.r!)
      .attr("fill", d => {
        const narrative = d.data.narrative || "other"
        return narrativeColors[narrative] || "#6B7280"
      })
      .attr("fill-opacity", 0.3)
      .attr("stroke", d => {
        const narrative = d.data.narrative || "other"
        return narrativeColors[narrative] || "#6B7280"
      })
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .style("transition", "all 0.3s ease")
      .on("click", (event, d) => {
        const narrative = d.data.narrative || "other"
        setSelectedNarrative(selectedNarrative === narrative ? null : narrative)
      })
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill-opacity", 0.6)
          .attr("stroke-width", 3)
          .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.2))")
        
        // Show narrative name in tooltip
        const narrative = d.data.narrative || "other"
        tooltip.style("visibility", "visible")
          .html(`
            <div style="text-align: center;">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; text-transform: capitalize;">
                ${narrative.replace("-", " ")}
              </div>
              <div style="font-size: 11px; color: #ccc;">
                ${d.children?.length || 0} tokens • ${d.value || 0} total mentions
              </div>
            </div>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
      })
      .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill-opacity", 0.3)
          .attr("stroke-width", 2)
          .style("filter", "none")
        
        tooltip.style("visibility", "hidden")
      })

    // Add subtle floating animation to narrative circles
    narrativeNodes.selectAll("circle")
      .transition()
      .duration(2000 + Math.random() * 1000)
      .ease(d3.easeSinInOut)
      .attr("transform", "translate(0, -2)")
      .transition()
      .duration(2000 + Math.random() * 1000)
      .ease(d3.easeSinInOut)
      .attr("transform", "translate(0, 2)")
      .on("end", function repeat() {
        d3.select(this)
          .transition()
          .duration(2000 + Math.random() * 1000)
          .ease(d3.easeSinInOut)
          .attr("transform", "translate(0, -2)")
          .transition()
          .duration(2000 + Math.random() * 1000)
          .ease(d3.easeSinInOut)
          .attr("transform", "translate(0, 2)")
          .on("end", repeat)
      })

    // Draw token circles (child nodes) - now in zoomGroup
    const tokenNodes = zoomGroup.selectAll(".token")
      .data(packedRoot.descendants().filter(d => d.depth === 2))
      .enter().append("g")
      .attr("class", "token")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)

    // Create circle backgrounds
    tokenNodes.append("circle")
      .attr("r", d => d.r!)
      .attr("fill", d => {
        const narrative = d.parent?.data.narrative || "other"
        return narrativeColors[narrative] || "#6B7280"
      })
      .attr("fill-opacity", 0.2)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .style("transition", "all 0.2s ease")

    // Add token icons
    tokenNodes.each(function(d) {
      const node = d3.select(this)
      const iconUrl = d.data.icon

      if (iconUrl && iconUrl.trim() !== "") {
        // Create a clip path for circular image
        const clipId = `clip-${d.data.symbol}-${Math.random().toString(36).substr(2, 9)}`
        
        svg.append("defs").append("clipPath")
          .attr("id", clipId)
          .append("circle")
          .attr("r", d.r! - 2) // Slightly smaller than the background circle
          .attr("cx", 0)
          .attr("cy", 0)

        // Add the image
        node.append("image")
          .attr("href", iconUrl)
          .attr("x", -d.r! + 4)
          .attr("y", -d.r! + 4)
          .attr("width", (d.r! - 4) * 2)
          .attr("height", (d.r! - 4) * 2)
          .attr("clip-path", `url(#${clipId})`)
          .style("cursor", "pointer")
          .on("error", function() {
            // If image fails to load, show fallback
            d3.select(this).remove()
            showTokenFallback(node, d)
          })
      } else {
        // No icon available, show fallback
        showTokenFallback(node, d)
      }
    })

    // Function to show fallback token representation
    function showTokenFallback(node: any, d: d3.HierarchyCircularNode<HierarchyNode>) {
      node.append("circle")
        .attr("r", d.r! - 4)
        .attr("fill", () => {
          const narrative = d.parent?.data.narrative || "other"
          return narrativeColors[narrative] || "#6B7280"
        })
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .style("cursor", "pointer")

      // Add token symbol text
      node.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("font-size", Math.min(d.r! / 2.5, 10))
        .attr("font-weight", "600")
        .attr("fill", "white")
        .style("pointer-events", "none")
        .style("text-shadow", "1px 1px 1px rgba(0,0,0,0.7)")
        .text(() => {
          const symbol = d.data.symbol || ""
          return d.r! > 15 ? symbol.toUpperCase() : ""
        })
    }

    // Add hover effects to all token nodes
    tokenNodes
      .on("mouseover", function(event, d) {
        setHoveredToken(d.data.symbol || null)
        
        // Animate the hovered token
        d3.select(this)
          .transition()
          .duration(150)
          .attr("transform", `translate(${d.x}, ${d.y}) scale(1.2)`)
          .style("filter", "brightness(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))")

        // Find the original token data to get narratives
        const originalToken = data.tokens?.find(token => token.symbol === d.data.symbol)
        const narratives = originalToken?.narratives || []

        tooltip.style("visibility", "visible")
          .html(`
            <div><strong>$${(d.data.symbol || "").toUpperCase()}</strong></div>
            <div>Mentions: ${d.data.total_tweets}</div>
            ${d.data.volume_24hr ? `<div>24h Volume: ${formatNumber(d.data.volume_24hr!)}</div>` : ""}
            ${d.data.first_tweet_time ? `<div>Since: ${formatDate(d.data.first_tweet_time!)}</div>` : ""}
            ${narratives.length > 0 ? `
              <div style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 6px;">
                <div style="font-size: 10px; color: #ccc; margin-bottom: 4px;">Categories:</div>
                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                  ${narratives.map(narrative => `
                    <span style="
                      background: ${narrativeColors[narrative] || '#6B7280'}; 
                      color: white; 
                      padding: 2px 6px; 
                      border-radius: 8px; 
                      font-size: 9px;
                      text-transform: capitalize;
                    ">${narrative.replace("-", " ")}</span>
                  `).join('')}
                </div>
              </div>
            ` : ""}
          `)
      })
      .on("mousemove", (event) => {
        tooltip.style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px")
      })
      .on("mouseout", function() {
        setHoveredToken(null)
        
        // Reset the token appearance
        d3.select(this)
          .transition()
          .duration(150)
          .attr("transform", function(d: any) { return `translate(${d.x}, ${d.y}) scale(1)` })
          .style("filter", "none")

        tooltip.style("visibility", "hidden")
      })
      .on("click", function(event, d) {
        // Add click animation
        d3.select(this)
          .transition()
          .duration(100)
          .attr("transform", `translate(${d.x}, ${d.y}) scale(0.9)`)
          .transition()
          .duration(100)
          .attr("transform", `translate(${d.x}, ${d.y}) scale(1)`)
      })

    // Add subtle pulsing animation to token circles
    tokenNodes
      .style("opacity", 0)
      .transition()
      .delay((d, i) => i * 50) // Stagger the appearance
      .duration(500)
      .style("opacity", 1)

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove()
    }
  }

  useEffect(() => {
    fetchTokenData()
  }, [interval, authorHandle])

  useEffect(() => {
    if (data && !loading) {
      const cleanup = renderCircularPacking()
      return cleanup
    }
  }, [data, loading, selectedNarrative])

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    return `$${num.toFixed(0)}`
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return "Unknown"
    }
  }

  if (loading) {
    return (
      <div className="card-pastel !bg-white p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!error && data && Object.keys(data).length === 0) {
    return null
  }

  if (error || !data) {
    return (
      <div className="card-pastel !bg-white p-6">
        <div className="text-center">
          <Coins className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">{retryCount > 0 ? `${error}` : error || "No token data available"}</p>
          <button
            onClick={() => fetchTokenData()}
            disabled={retryCount > 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              retryCount > 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {retryCount > 0 ? "Retrying..." : "Retry"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-pastel !bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Coins className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Token Overview</h3>
        </div>

        {/* Interval Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {intervalOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setInterval(option.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                interval === option.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <Hash className="w-4 h-4 text-blue-600 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-900">{data.unique_token_count}</div>
          <div className="text-xs text-gray-600">Unique Tokens</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-900">{data.total_mentions}</div>
          <div className="text-xs text-gray-600">Total Mentions</div>
        </div>
        <div className="text-center p-2 bg-orange-50 rounded-lg">
          <Coins className="w-4 h-4 text-orange-600 mx-auto mb-1" />
          <div className="text-sm font-bold text-gray-900 uppercase">
            {data.most_mentioned_token ? `$${data.most_mentioned_token.symbol}` : "N/A"}
          </div>
          <div className="text-xs text-gray-600">
            {data.most_mentioned_token ? `${data.most_mentioned_token.mention_count} mentions` : "-"}
          </div>
        </div>
      </div>

      {/* Circular Packing Visualization */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Token Narratives Map</h4>
        <div className="flex flex-col lg:flex-row gap-6 bg-gray-50 rounded-xl p-4">
          {/* Visualization Container */}
          <div className="flex-1 overflow-x-auto">
            <svg ref={svgRef} className="w-full" style={{ minHeight: "400px" }}></svg>
      </div>

          {/* Legend on the right side */}
          <div className="lg:w-48 lg:flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-gray-900">Narrative Legend</h5>
              {selectedNarrative && (
                <button
                  onClick={() => setSelectedNarrative(null)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Show All
                </button>
                  )}
                </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1 lg:space-y-1 lg:gap-0">
              {(() => {
                // Sort narratives by mention count (descending)
                const sortedNarratives = Object.entries(narrativeColors)
                  .filter(([narrative]) => {
                    return data?.narrative_breakdown?.[narrative] > 0 || 
                      (narrative === "other" && data?.tokens?.some(t => t.narratives.length === 0))
                  })
                  .sort(([a], [b]) => {
                    const countA = data?.narrative_breakdown?.[a] || 0
                    const countB = data?.narrative_breakdown?.[b] || 0
                    return countB - countA
                  })
                
                // Show only top 6 if not expanded
                const narrativesToShow = showAllLegends ? sortedNarratives : sortedNarratives.slice(0, 6)
                
                return narrativesToShow.map(([narrative, color]) => {
                  const isSelected = selectedNarrative === narrative
                  const hasTokens = data?.narrative_breakdown?.[narrative] > 0 || 
                    (narrative === "other" && data?.tokens?.some(t => t.narratives.length === 0))
                  
                  return (
                    <div 
                        key={narrative}
                      className={`flex items-center gap-2 py-1 px-2 rounded-md cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'bg-white shadow-sm ring-2 ring-blue-200' 
                          : hasTokens 
                            ? 'hover:bg-white/50' 
                            : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => {
                        if (hasTokens) {
                          setSelectedNarrative(isSelected ? null : narrative)
                        }
                      }}
                    >
                      <div 
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className={`text-xs capitalize leading-tight ${
                        isSelected ? 'text-gray-900 font-medium' : 'text-gray-600'
                      }`}>
                        {narrative.replace("-", " ")}
                      </span>
                      {hasTokens && (
                        <span className="text-xs text-gray-400 ml-auto">
                          {data?.narrative_breakdown?.[narrative] || 0}
                      </span>
                    )}
                  </div>
                  )
                })
              })()}
              
              {/* Show More/Less Button */}
              {(() => {
                const totalNarratives = Object.entries(narrativeColors)
                  .filter(([narrative]) => {
                    return data?.narrative_breakdown?.[narrative] > 0 || 
                      (narrative === "other" && data?.tokens?.some(t => t.narratives.length === 0))
                  }).length
                
                if (totalNarratives > 6) {
                  return (
                    <button
                      onClick={() => setShowAllLegends(!showAllLegends)}
                      className="flex items-center gap-1 py-1 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200 mt-1"
                    >
                      <span>{showAllLegends ? 'Show less...' : `See more... (+${totalNarratives - 6})`}</span>
                    </button>
                  )
                }
                return null
              })()}
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Click on narrative bubbles to highlight • Hover over tokens for details • Bubble size represents mentions
        </div>
      </div>
    </div>
  )
}
