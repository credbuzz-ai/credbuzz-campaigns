"use client"

import { useState, useEffect } from "react"
import { Coins, TrendingUp, Hash, Calendar, DollarSign } from "lucide-react"
import type { TokenOverviewResponse } from "../types"

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
  ai: "bg-blue-100 text-blue-800",
  defi: "bg-green-100 text-green-800",
  meme: "bg-pink-100 text-pink-800",
  gamefi: "bg-purple-100 text-purple-800",
  nft: "bg-indigo-100 text-indigo-800",
  rwa: "bg-orange-100 text-orange-800",
  dao: "bg-yellow-100 text-yellow-800",
  "vc-backed": "bg-gray-100 text-gray-800",
  launchpad: "bg-cyan-100 text-cyan-800",
  privacy: "bg-red-100 text-red-800",
  "yield-farm": "bg-lime-100 text-lime-800",
  dex: "bg-emerald-100 text-emerald-800",
  socialfi: "bg-violet-100 text-violet-800",
  metaverse: "bg-fuchsia-100 text-fuchsia-800",
  zkproof: "bg-slate-100 text-slate-800",
}

export default function TokenOverview({ authorHandle }: TokenOverviewProps) {
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3
  const RETRY_DELAY = 1000 // 1 second base delay
  const [data, setData] = useState<TokenOverviewResponse["result"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [interval, setInterval] = useState<Interval>("7day")

  const fetchTokenData = async (attempt = 0) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `https://api.cred.buzz/user/author-token-overview?author_handle=${authorHandle}&interval=${interval}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(5000), // 5 second timeout
        },
      )

      if (response.ok) {
        const result = (await response.json()) as TokenOverviewResponse
        if (result.result) {
          setData(result.result)
          setRetryCount(0) // Reset retry count on success
        } else {
          throw new Error("Invalid response format")
        }
      } else {
        throw new Error(`API Error: ${response.status}`)
      }
    } catch (error) {
      console.error(`Failed to fetch token data (attempt ${attempt + 1}):`, error)

      // Retry logic
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, attempt) // Exponential backoff
        setRetryCount(attempt + 1)
        setError(`Retrying... (${attempt + 1}/${MAX_RETRIES})`)

        setTimeout(() => {
          fetchTokenData(attempt + 1)
        }, delay)
        return
      }

      // Max retries reached, show error and fallback data
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

  useEffect(() => {
    fetchTokenData()
  }, [interval, authorHandle])

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

  const getNarrativeColor = (narrative: string): string => {
    return narrativeColors[narrative.toLowerCase()] || "bg-gray-100 text-gray-800"
  }

  const sortedNarratives = data
    ? Object.entries(data.narrative_breakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8) // Show top 8 narratives
    : []

  const sortedTokens = data ? data.tokens.sort((a, b) => b.total_tweets - a.total_tweets).slice(0, 12) : []

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
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
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
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-xl">
          <Hash className="w-5 h-5 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{data.unique_token_count}</div>
          <div className="text-sm text-gray-600">Unique Tokens</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-xl">
          <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{data.total_mentions}</div>
          <div className="text-sm text-gray-600">Total Mentions</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-xl">
          <Coins className="w-5 h-5 text-orange-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-gray-900 uppercase">${data.most_mentioned_token.symbol}</div>
          <div className="text-sm text-gray-600">{data.most_mentioned_token.mention_count} mentions</div>
        </div>
      </div>

      {/* Narrative Breakdown */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Top Narratives</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {sortedNarratives.map(([narrative, count]) => (
            <div key={narrative} className={`px-3 py-2 rounded-lg text-center ${getNarrativeColor(narrative)}`}>
              <div className="font-semibold text-sm capitalize">{narrative.replace("-", " ")}</div>
              <div className="text-xs opacity-75">{count} mentions</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Tokens */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Most Mentioned Tokens</h4>
        <div className="grid gap-3">
          {sortedTokens.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {/* Token Icon */}
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                {token.icon ? (
                  <img
                    src={token.icon || "/placeholder.svg"}
                    alt={token.symbol}
                    className="w-8 h-8 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                      e.currentTarget.nextElementSibling!.style.display = "flex"
                    }}
                  />
                ) : null}
                <div
                  className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 ${
                    token.icon ? "hidden" : "flex"
                  }`}
                >
                  {token.symbol.slice(0, 2).toUpperCase()}
                </div>
              </div>

              {/* Token Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 uppercase">${token.symbol}</span>
                  <span className="text-sm text-gray-500">{token.total_tweets} tweets</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Since {formatDate(token.first_tweet_time)}</span>
                  </div>
                  {token.volume_24hr > 0 && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>{formatNumber(token.volume_24hr)} 24h vol</span>
                    </div>
                  )}
                </div>
                {/* Narratives */}
                {token.narratives.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {token.narratives.slice(0, 3).map((narrative) => (
                      <span
                        key={narrative}
                        className={`px-2 py-0.5 rounded-full text-xs ${getNarrativeColor(narrative)}`}
                      >
                        {narrative.replace("-", " ")}
                      </span>
                    ))}
                    {token.narratives.length > 3 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                        +{token.narratives.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
