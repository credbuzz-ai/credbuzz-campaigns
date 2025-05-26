"use client"

import { useState, useEffect } from "react"
import { Sparkles, Heart, MessageCircle, Repeat2, Eye, TrendingUp, TrendingDown } from "lucide-react"
import type { Tweet, TopTweetsResponse } from "../types"

interface SmartFeedProps {
  authorHandle?: string
}

type Interval = "1day" | "7day" | "30day"
type SortBy = "view_count_desc" | "like_count_desc" | "retweet_count_desc" | "reply_count_desc"

export default function SmartFeed({ authorHandle = "eliz883" }: SmartFeedProps) {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [interval, setInterval] = useState<Interval>("7day")
  const [sortBy, setSortBy] = useState<SortBy>("like_count_desc")

  const fetchTweets = async () => {
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
        },
      )

      if (response.ok) {
        const data = (await response.json()) as TopTweetsResponse
        if (data.result && Array.isArray(data.result)) {
          // Sanitize the data to ensure all numeric fields have default values
          const sanitizedTweets = data.result.map((tweet) => ({
            ...tweet,
            view_count: tweet.view_count || 0,
            like_count: tweet.like_count || 0,
            quote_count: tweet.quote_count || 0,
            reply_count: tweet.reply_count || 0,
            retweet_count: tweet.retweet_count || 0,
            sentiment: tweet.sentiment,
          }))
          setTweets(sanitizedTweets)
        } else {
          setError("Invalid response format")
          setTweets([])
        }
      } else {
        setError(`API Error: ${response.status}`)
        setTweets([])
      }
    } catch (error) {
      console.error("Failed to fetch tweets:", error)
      setError("Failed to fetch tweets")
      // Fallback data for demo
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
        },
        {
          tweet_id: "2",
          author_handle: authorHandle,
          body: "$ETH looking for this sweep. The market is showing strong signals for a potential breakout.",
          tweet_create_time: "2025-04-18T15:20:00Z",
          view_count: 45123,
          like_count: 892,
          quote_count: 12,
          reply_count: 67,
          retweet_count: 234,
          profile_image_url: "/placeholder.svg?height=40&width=40",
          sentiment: 0.6,
        },
        {
          tweet_id: "3",
          author_handle: authorHandle,
          body: "gm leggende !!!! spending this weekend relaxing away from the charts! you know I avoid operating on the weekend! I wish you and your wonderful families a peaceful Sunday",
          tweet_create_time: "2025-04-17T08:53:46Z",
          view_count: 51978,
          like_count: 463,
          quote_count: 0,
          reply_count: 112,
          retweet_count: 13,
          profile_image_url: "/placeholder.svg?height=40&width=40",
          sentiment: null,
        },
        {
          tweet_id: "4",
          author_handle: authorHandle,
          body: "$ENA the dumps can be good opportunities to build a spot position. Always DYOR and manage your risk properly.",
          tweet_create_time: "2025-04-16T19:03:29Z",
          view_count: 34685,
          like_count: 444,
          quote_count: 0,
          reply_count: 83,
          retweet_count: 48,
          profile_image_url: "/placeholder.svg?height=40&width=40",
          sentiment: 0.3,
        },
        {
          tweet_id: "5",
          author_handle: authorHandle,
          body: "as usual enjoying the weekend was the best trader! Sometimes the best trade is no trade at all.",
          tweet_create_time: "2025-04-15T17:37:19Z",
          view_count: 31020,
          like_count: 315,
          quote_count: 0,
          reply_count: 91,
          retweet_count: 5,
          profile_image_url: "/placeholder.svg?height=40&width=40",
          sentiment: null,
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
    // Handle null, undefined, or non-numeric values
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
        `<span class="text-blue-600 font-medium">${token}</span>`,
      )
    })

    return highlightedText
  }

  const getDisplayHandle = (handle: string) => {
    if (!handle) return "unknown"
    return handle.startsWith("@") ? handle.slice(1) : handle
  }

  return (
    <div className="w-96 bg-white border-l border-gray-200 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Smart Feed</h2>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-2 block font-medium">Interval</label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value as Interval)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1day">1 Day</option>
              <option value="7day">7 Days</option>
              <option value="30day">30 Days</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-2 block font-medium">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="like_count_desc">Likes</option>
              <option value="view_count_desc">Views</option>
              <option value="retweet_count_desc">Retweets</option>
              <option value="reply_count_desc">Replies</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading tweets...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500 text-sm">
            <p>{error}</p>
            <button onClick={fetchTweets} className="mt-3 text-blue-600 hover:text-blue-800 underline">
              Retry
            </button>
          </div>
        ) : tweets.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No tweets found</div>
        ) : (
          <div className="space-y-6 p-6">
            {tweets.map((tweet) => (
              <div key={tweet.tweet_id} className="border-b border-gray-100 pb-6 last:border-b-0">
                {/* Tweet Header */}
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={tweet.profile_image_url || "/placeholder.svg?height=40&width=40"}
                    alt={getDisplayHandle(tweet.author_handle)}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 text-sm">{getDisplayHandle(tweet.author_handle)}</span>
                      <span className="text-gray-500 text-xs">@{getDisplayHandle(tweet.author_handle)}</span>
                      <span className="text-gray-400 text-xs">·</span>
                      <span className="text-gray-500 text-xs">{formatDate(tweet.tweet_create_time)}</span>
                      {getSentimentIcon(tweet.sentiment)}
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
                <div className="flex items-center gap-6 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{formatNumber(tweet.view_count)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{formatNumber(tweet.like_count)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{formatNumber(tweet.reply_count)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Repeat2 className="w-3.5 h-3.5" />
                    <span>{formatNumber(tweet.retweet_count)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
