"use client"

import { useState, useEffect } from "react"
import { Sparkles, Heart, MessageCircle, Repeat2, Eye, TrendingUp, TrendingDown } from "lucide-react"
import type { Tweet, TopTweetsResponse } from "../types"
import Link from "next/link"

interface SmartFeedProps {
  authorHandle?: string
}

type Interval = "1day" | "7day" | "30day"
type SortBy = "view_count_desc" | "like_count_desc" | "retweet_count_desc" | "reply_count_desc"

const intervalOptions = [
  { value: "1day" as Interval, label: "24H" },
  { value: "7day" as Interval, label: "7D" },
  { value: "30day" as Interval, label: "30D" },
]

const sortOptions = [
  { value: "like_count_desc" as SortBy, label: "Likes" },
  { value: "view_count_desc" as SortBy, label: "Views" },
  { value: "retweet_count_desc" as SortBy, label: "Shares" },
  { value: "reply_count_desc" as SortBy, label: "Replies" },
]

export default function SmartFeed({ authorHandle = "eliz883" }: SmartFeedProps) {
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3
  const RETRY_DELAY = 1000 // 1 second base delay
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [interval, setInterval] = useState<Interval>("7day")
  const [sortBy, setSortBy] = useState<SortBy>("like_count_desc")

  const fetchTweets = async (attempt = 0) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `https://api.cred.buzz/user/get-top-tweets?author_handle=${authorHandle}&interval=${interval}&sort_by=${sortBy}&limit=100`,
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
        const data = (await response.json()) as TopTweetsResponse
        if (data.result && Array.isArray(data.result)) {
          const sanitizedTweets = data.result.map((tweet) => ({
            ...tweet,
            view_count: tweet.view_count || 0,
            like_count: tweet.like_count || 0,
            quote_count: tweet.quote_count || 0,
            reply_count: tweet.reply_count || 0,
            retweet_count: tweet.retweet_count || 0,
            sentiment: tweet.sentiment,
            tweet_category: tweet.tweet_category || null
          }))
          setTweets(sanitizedTweets)
          setRetryCount(0) // Reset retry count on success
        } else {
          throw new Error("Invalid response format")
        }
      } else {
        throw new Error(`API Error: ${response.status}`)
      }
    } catch (error) {
      console.error(`Failed to fetch tweets (attempt ${attempt + 1}):`, error)

      // Retry logic
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, attempt) // Exponential backoff
        setRetryCount(attempt + 1)
        setError(`Retrying... (${attempt + 1}/${MAX_RETRIES})`)

        setTimeout(() => {
          fetchTweets(attempt + 1)
        }, delay)
        return
      }

      // Max retries reached, show error and fallback data
      setError("Failed to fetch tweets")
      setRetryCount(0)
      // Enhanced fallback data for demo
      setTweets([
        {
          tweet_id: "1",
          author_handle: authorHandle,
          body: "At this point the magic of crypto is gone, and we're at a 'we know they know we know' point. There's no unfathomable wonder, no distant frontier left",
          tweet_create_time: "2025-04-19T10:30:00Z",
          view_count: 88294,
          like_count: 1100,
          quote_count: 0,
          reply_count: 123,
          retweet_count: 97,
          profile_image_url: "/placeholder.svg?height=40&width=40",
          sentiment: 0.2,
          tweet_category: "market-analysis"
        },
        {
          tweet_id: "2",
          author_handle: authorHandle,
          body: "$ETH looking for this sweep. The market is showing strong signals for a potential breakout. 📈",
          tweet_create_time: "2025-04-18T15:20:00Z",
          view_count: 45123,
          like_count: 892,
          quote_count: 12,
          reply_count: 67,
          retweet_count: 234,
          profile_image_url: "/placeholder.svg?height=40&width=40",
          sentiment: 0.6,
          tweet_category: "price-action"
        },
        {
          tweet_id: "3",
          author_handle: authorHandle,
          body: "gm leggende !!!! spending this weekend relaxing away from the charts! you know I avoid operating on the weekend! I wish you and your wonderful families a peaceful Sunday ☀️",
          tweet_create_time: "2025-04-17T08:53:46Z",
          view_count: 51978,
          like_count: 463,
          quote_count: 0,
          reply_count: 112,
          retweet_count: 13,
          profile_image_url: "/placeholder.svg?height=40&width=40",
          sentiment: null,
          tweet_category: "community"
        },
        {
          tweet_id: "4",
          author_handle: authorHandle,
          body: "$ENA the dumps can be good opportunities to build a spot position. Always DYOR and manage your risk properly. 🎯",
          tweet_create_time: "2025-04-16T19:03:29Z",
          view_count: 34685,
          like_count: 444,
          quote_count: 0,
          reply_count: 83,
          retweet_count: 48,
          profile_image_url: "/placeholder.svg?height=40&width=40",
          sentiment: 0.3,
          tweet_category: "trading-strategy"
        },
        {
          tweet_id: "5",
          author_handle: authorHandle,
          body: "as usual enjoying the weekend was the best trader! Sometimes the best trade is no trade at all. 🧘‍♀️",
          tweet_create_time: "2025-04-15T17:37:19Z",
          view_count: 31020,
          like_count: 315,
          quote_count: 0,
          reply_count: 91,
          retweet_count: 5,
          profile_image_url: "/placeholder.svg?height=40&width=40",
          sentiment: null,
          tweet_category: "trading-strategy"
        },
        {
          tweet_id: "6",
          author_handle: authorHandle,
          body: "Market volatility is creating some interesting opportunities. Remember to always manage your risk and never invest more than you can afford to lose. 💡",
          tweet_create_time: "2025-04-14T12:15:30Z",
          view_count: 28450,
          like_count: 287,
          quote_count: 5,
          reply_count: 76,
          retweet_count: 23,
          profile_image_url: "/placeholder.svg?height=40&width=40",
          sentiment: 0.1,
          tweet_category: "market-analysis"
        },
        {
          tweet_id: "7",
          author_handle: authorHandle,
          body: "$BTC consolidation phase continues. Patience is key in this market. The next move could be significant. ⏳",
          tweet_create_time: "2025-04-13T16:42:18Z",
          view_count: 42180,
          like_count: 398,
          quote_count: 8,
          reply_count: 95,
          retweet_count: 67,
          profile_image_url: "/placeholder.svg?height=40&width=40",
          sentiment: 0.4,
          tweet_category: "price-action"
        },
        {
          tweet_id: "8",
          author_handle: authorHandle,
          body: "DeFi protocols are evolving rapidly. The innovation in this space continues to amaze me. We're still early! 🚀",
          tweet_create_time: "2025-04-12T09:28:45Z",
          view_count: 35670,
          like_count: 456,
          quote_count: 15,
          reply_count: 89,
          retweet_count: 78,
          profile_image_url: "/placeholder.svg?height=40&width=40",
          sentiment: 0.7,
          tweet_category: "ecosystem-news"
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTweets()
  }, [interval, sortBy, authorHandle])

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) {
      return "0"
    }

    const numValue = Number(num)
    if (numValue >= 1000000) return `${(numValue / 1000000).toFixed(1)}M`
    if (numValue >= 1000) return `${(numValue / 1000).toFixed(1)}K`
    return numValue.toString()
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "now"
      }

      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) return "1d"
      if (diffDays < 7) return `${diffDays}d`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w`
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } catch (error) {
      return "now"
    }
  }

  const getSentimentIcon = (sentiment: number | null) => {
    if (sentiment === null || sentiment === undefined) return null
    if (sentiment > 0.1) return <TrendingUp className="w-3 h-3 text-green-500" />
    if (sentiment < -0.1) return <TrendingDown className="w-3 h-3 text-red-500" />
    return null
  }

  const extractTokens = (text: string): string[] => {
    if (!text || typeof text !== "string") return []
    const tokenRegex = /\$[A-Z]{2,10}/g
    return text.match(tokenRegex) || []
  }

  const highlightTokens = (text: string) => {
    if (!text || typeof text !== "string") return text

    const tokens = extractTokens(text)
    let highlightedText = text

    tokens.forEach((token) => {
      highlightedText = highlightedText.replace(
        new RegExp(`\\${token}`, "g"),
        `<span class="text-blue-600 font-semibold bg-blue-50 px-1 py-0.5 rounded text-xs">${token}</span>`,
      )
    })

    return highlightedText
  }

  const getDisplayHandle = (handle: string) => {
    if (!handle) return "unknown"
    return handle.startsWith("@") ? handle.slice(1) : handle
  }

  return (
    <div className="w-[480px] lg:w-[480px] md:w-80 sm:w-72 flex flex-col">
      {/* Smart Feed Container with height constraint */}
      <div className="card-pastel !bg-slate-300 flex flex-col max-h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="p-6 border-b border-slate-400/50 flex-shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/60 rounded-xl">
              <Sparkles className="w-5 h-5 text-gray-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Smart Feed</h2>
          </div>

          {/* Minimalistic Controls */}
          <div className="space-y-4">
            {/* Time Range Selector - Minimalistic */}
            <div className="flex items-center justify-center">
              <div className="flex bg-gray-800/20 rounded-lg p-1">
                {intervalOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setInterval(option.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      interval === option.value
                        ? "bg-gray-700 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-800 hover:bg-white/30"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Selector - Minimalistic */}
            <div className="flex items-center justify-center">
              <div className="flex flex-wrap gap-2 justify-center">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                      sortBy === option.value
                        ? "bg-gray-700 text-white"
                        : "bg-white/40 text-gray-600 hover:bg-white/60 hover:text-gray-800"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feed Content with constrained height */}
        <div className="flex-1 overflow-y-auto bg-white/30 backdrop-blur-sm min-h-0">
          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white/60 rounded-xl p-4 animate-pulse">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm mb-3">{retryCount > 0 ? `${error}` : error}</p>
                <button
                  onClick={() => fetchTweets()}
                  disabled={retryCount > 0}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    retryCount > 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-red-100 hover:bg-red-200 text-red-700"
                  }`}
                >
                  {retryCount > 0 ? "Retrying..." : "Retry"}
                </button>
              </div>
            </div>
          ) : tweets.length === 0 ? (
            <div className="p-6 text-center">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
                <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No tweets found</p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {tweets.map((tweet, index) => (
                <Link
                  key={tweet.tweet_id}
                  href={`https://twitter.com/${tweet.author_handle}/status/${tweet.tweet_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/50 hover:bg-white/80 transition-all duration-200 hover:shadow-sm">
                    {/* Tweet Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <img
                        src={tweet.profile_image_url || "/placeholder.svg?height=40&width=40"}
                        alt={getDisplayHandle(tweet.author_handle)}
                        className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-white/50"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">
                            {getDisplayHandle(tweet.author_handle)}
                          </span>
                          <span className="text-gray-500 text-xs">@{getDisplayHandle(tweet.author_handle)}</span>
                          <span className="text-gray-400 text-xs">·</span>
                          <span className="text-gray-500 text-xs">{formatDate(tweet.tweet_create_time)}</span>
                          {getSentimentIcon(tweet.sentiment)}
                          {tweet.tweet_category && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                              {tweet.tweet_category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tweet Content */}
                    <div className="mb-4">
                      <p
                        className="text-gray-800 text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: highlightTokens(tweet.body || "") }}
                      />
                    </div>

                    {/* Engagement Metrics */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500 group">
                        <div className="p-1.5 rounded-lg group-hover:bg-gray-100/50 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">{formatNumber(tweet.view_count)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 group">
                        <div className="p-1.5 rounded-lg group-hover:bg-red-50 transition-colors">
                          <Heart className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">{formatNumber(tweet.like_count)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 group">
                        <div className="p-1.5 rounded-lg group-hover:bg-blue-50 transition-colors">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">{formatNumber(tweet.reply_count)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 group">
                        <div className="p-1.5 rounded-lg group-hover:bg-green-50 transition-colors">
                          <Repeat2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">{formatNumber(tweet.retweet_count)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
