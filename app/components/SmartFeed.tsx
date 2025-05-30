"use client"

import { useState, useEffect } from "react"
import { Sparkles, Heart, MessageCircle, Repeat2, Eye, TrendingUp, TrendingDown, ChevronDown, Zap } from "lucide-react"
import type { Tweet, TopTweetsResponse } from "../types"
import Link from "next/link"

interface SmartFeedProps {
  authorHandle?: string
}

type Interval = "1day" | "7day" | "30day"
type SortBy = "view_count_desc" | "like_count_desc" | "retweet_count_desc" | "reply_count_desc" | "tweet_create_time_desc"

const intervalOptions = [
  { value: "1day" as Interval, label: "24H" },
  { value: "7day" as Interval, label: "7D" },
  { value: "30day" as Interval, label: "30D" },
]

const sortOptions = [
  { value: "view_count_desc" as SortBy, label: "Top Views" },
  { value: "like_count_desc" as SortBy, label: "Most Liked" },
  { value: "retweet_count_desc" as SortBy, label: "Most Shared" },
  { value: "reply_count_desc" as SortBy, label: "Most Discussed" },
  { value: "tweet_create_time_desc" as SortBy, label: "Most Recent" },
]

export default function SmartFeed({ authorHandle = "eliz883" }: SmartFeedProps) {
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3
  const RETRY_DELAY = 1000 // 1 second base delay
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [interval, setInterval] = useState<Interval>("7day")
  const [sortBy, setSortBy] = useState<SortBy>("view_count_desc")
  const [expandedTweets, setExpandedTweets] = useState<Set<string>>(new Set())
  const [showSortDropdown, setShowSortDropdown] = useState(false)

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

      if (diffDays === 1) return "May 29"
      if (diffDays === 2) return "May 30"
      if (diffDays < 7) return `May ${31 - diffDays}`
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
        `<span class="text-blue-600 font-semibold">${token}</span>`,
      )
    })

    return highlightedText
  }

  const getDisplayHandle = (handle: string) => {
    if (!handle) return "unknown"
    return handle.startsWith("@") ? handle.slice(1) : handle
  }

  const toggleTweetExpansion = (tweetId: string) => {
    const newExpanded = new Set(expandedTweets)
    if (newExpanded.has(tweetId)) {
      newExpanded.delete(tweetId)
    } else {
      newExpanded.add(tweetId)
    }
    setExpandedTweets(newExpanded)
  }

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength)
  }

  const getSortLabel = () => {
    return sortOptions.find(option => option.value === sortBy)?.label || "Top Views"
  }

  return (
    <div className="w-full flex flex-col">
      {/* Smart Feed Container with controlled height */}
      <div className="bg-gray-100 rounded-2xl flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">Smart Feed</h2>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">{getSortLabel()}</span>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[180px] z-10">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value)
                        setShowSortDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        sortBy === option.value 
                          ? 'text-blue-600 font-medium bg-blue-50' 
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feed Content with controlled scrolling */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="bg-white rounded-2xl p-6">
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
            <div className="text-center py-8">
              <div className="bg-white rounded-2xl p-8">
                <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No tweets found</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {tweets.map((tweet, index) => {
                const isExpanded = expandedTweets.has(tweet.tweet_id)
                const needsTruncation = tweet.body && tweet.body.length > 200
                const displayText = needsTruncation && !isExpanded 
                  ? truncateText(tweet.body || "", 200) + "..."
                  : tweet.body || ""

                return (
                  <Link
                    key={tweet.tweet_id}
                    href={`https://twitter.com/${tweet.author_handle}/status/${tweet.tweet_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="bg-white rounded-2xl p-6 hover:bg-gray-50 transition-colors border border-gray-100">
                      {/* Tweet Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={tweet.profile_image_url || "/placeholder.svg?height=48&width=48"}
                            alt={getDisplayHandle(tweet.author_handle)}
                            className="w-12 h-12 rounded-full"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-gray-900">
                                {getDisplayHandle(tweet.author_handle)}
                              </span>
                              {tweet.tweet_category === "influencer" && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            <span className="text-gray-500 text-sm">@{getDisplayHandle(tweet.author_handle)}</span>
                          </div>
                        </div>
                        <span className="text-gray-500 text-sm">{formatDate(tweet.tweet_create_time)}</span>
                      </div>

                      {/* Tweet Content */}
                      <div className="mb-4">
                        <p
                          className="text-gray-900 text-base leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: highlightTokens(displayText) }}
                        />
                        {needsTruncation && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toggleTweetExpansion(tweet.tweet_id)
                            }}
                            className="text-gray-500 text-sm mt-2 hover:text-gray-700 transition-colors flex items-center gap-1"
                          >
                            <span>{isExpanded ? "View less" : "View more"}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>

                      {/* Engagement Metrics */}
                      <div className="flex items-center gap-6 text-gray-500">
                        <div className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm font-medium">{formatNumber(tweet.retweet_count)}</span>
                        </div>
                        <div className="flex items-center gap-2 hover:text-red-600 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm font-medium">{formatNumber(tweet.like_count)}</span>
                        </div>
                        <div className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">{formatNumber(tweet.reply_count)}</span>
                        </div>
                        <div className="flex items-center gap-2 hover:text-green-600 transition-colors">
                          <Repeat2 className="w-4 h-4" />
                          <span className="text-sm font-medium">{formatNumber(tweet.quote_count)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-medium">{formatNumber(tweet.view_count)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
