"use client";

import {
  ChevronDown,
  Eye,
  Hash,
  Heart,
  MessageCircle,
  Repeat2,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../lib/constants";
import type { TopTweetsResponse, Tweet } from "../types";

interface SmartFeedProps {
  authorHandle?: string;
}

type Interval = "1day" | "7day" | "30day";
type SortBy =
  | "view_count_desc"
  | "like_count_desc"
  | "retweet_count_desc"
  | "reply_count_desc"
  | "tweet_create_time_desc";

const intervalOptions = [
  { value: "1day" as Interval, label: "24H" },
  { value: "7day" as Interval, label: "7D" },
  { value: "30day" as Interval, label: "30D" },
];

const sortOptions = [
  { value: "view_count_desc" as SortBy, label: "Top Views" },
  { value: "like_count_desc" as SortBy, label: "Most Liked" },
  { value: "retweet_count_desc" as SortBy, label: "Most Shared" },
  { value: "reply_count_desc" as SortBy, label: "Most Discussed" },
  { value: "tweet_create_time_asc" as SortBy, label: "Most Recent" },
];

export default function SmartFeed({
  authorHandle = "eliz883",
}: SmartFeedProps) {
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second base delay
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interval, setInterval] = useState<Interval>("7day");
  const [sortBy, setSortBy] = useState<SortBy>("view_count_desc");
  const [expandedTweets, setExpandedTweets] = useState<Set<string>>(new Set());
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const fetchTweets = async (attempt = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/get-top-tweets?author_handle=${authorHandle}&interval=${interval}&sort_by=${sortBy}&limit=100`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(5000), // 5 second timeout
        }
      );

      if (response.ok) {
        const data = (await response.json()) as TopTweetsResponse;
        if (data.result && Array.isArray(data.result)) {
          const sanitizedTweets = data.result.map((tweet) => ({
            ...tweet,
            view_count: tweet.view_count || 0,
            like_count: tweet.like_count || 0,
            quote_count: tweet.quote_count || 0,
            reply_count: tweet.reply_count || 0,
            retweet_count: tweet.retweet_count || 0,
            sentiment: tweet.sentiment,
            tweet_category: tweet.tweet_category || null,
          }));
          setTweets(sanitizedTweets);
          setRetryCount(0); // Reset retry count on success
        } else {
          throw new Error("Invalid response format");
        }
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to fetch tweets (attempt ${attempt + 1}):`, error);

      // Retry logic
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, attempt); // Exponential backoff
        setRetryCount(attempt + 1);
        setError(`Retrying... (${attempt + 1}/${MAX_RETRIES})`);

        setTimeout(() => {
          fetchTweets(attempt + 1);
        }, delay);
        return;
      }

      // Max retries reached, show error and fallback data
      setError("Failed to fetch tweets");
      setRetryCount(0);
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
          tweet_category: "market-analysis",
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
          tweet_category: "price-action",
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
          tweet_category: "community",
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
          tweet_category: "trading-strategy",
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
          tweet_category: "trading-strategy",
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
          tweet_category: "market-analysis",
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
          tweet_category: "price-action",
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
          tweet_category: "ecosystem-news",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, [interval, sortBy, authorHandle]);

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) {
      return "0";
    }

    const numValue = Number(num);
    if (numValue >= 1000000) return `${(numValue / 1000000).toFixed(1)}M`;
    if (numValue >= 1000) return `${(numValue / 1000).toFixed(1)}K`;
    return numValue.toString();
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "now";
      }

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "May 29";
      if (diffDays === 2) return "May 30";
      if (diffDays < 7) return `May ${31 - diffDays}`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w`;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "now";
    }
  };

  const getSentimentIcon = (sentiment: number | null) => {
    if (sentiment === null || sentiment === undefined) return null;
    if (sentiment > 0.1)
      return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (sentiment < -0.1)
      return <TrendingDown className="w-3 h-3 text-red-500" />;
    return null;
  };

  const extractTokens = (text: string): string[] => {
    if (!text || typeof text !== "string") return [];
    const tokenRegex = /\$[A-Z]{2,10}/g;
    return text.match(tokenRegex) || [];
  };

  const highlightTokens = (text: string) => {
    if (!text || typeof text !== "string") return text;

    const tokens = extractTokens(text);
    if (tokens.length === 0) return text;

    const parts = [];
    let lastIndex = 0;

    tokens.forEach((token) => {
      const index = text.indexOf(token, lastIndex);
      if (index !== -1) {
        // Add text before token
        if (index > lastIndex) {
          parts.push(text.substring(lastIndex, index));
        }
        // Add highlighted token
        parts.push(
          <span
            key={`${token}-${index}`}
            className="text-blue-600 font-semibold"
          >
            {token}
          </span>
        );
        lastIndex = index + token.length;
      }
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 1 ? parts : text;
  };

  const getDisplayHandle = (handle: string) => {
    if (!handle) return "unknown";
    return handle.startsWith("@") ? handle.slice(1) : handle;
  };

  const toggleTweetExpansion = (tweetId: string) => {
    const newExpanded = new Set(expandedTweets);
    if (newExpanded.has(tweetId)) {
      newExpanded.delete(tweetId);
    } else {
      newExpanded.add(tweetId);
    }
    setExpandedTweets(newExpanded);
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength);
  };

  const getSortLabel = () => {
    return (
      sortOptions.find((option) => option.value === sortBy)?.label ||
      "Top Views"
    );
  };

  return (
    <div className="card-trendsage sticky top-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#00D992]" />
          <h2 className="text-lg font-semibold text-gray-100">Smart Feed</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Interval Filter */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            {intervalOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setInterval(value)}
                className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                  interval === value
                    ? "bg-[#00D992] text-gray-900"
                    : "text-gray-300 hover:text-[#00D992] hover:bg-gray-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-[#00D992] hover:border-[#00D992]/50 transition-colors"
            >
              {getSortLabel()}
              <ChevronDown className="w-3 h-3" />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-gray-800 border border-gray-700 rounded-lg shadow-lg min-w-[150px]">
                {sortOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSortBy(value);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-700 transition-colors ${
                      sortBy === value
                        ? "text-[#00D992] bg-gray-700"
                        : "text-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error handling */}
      {error && retryCount === 0 && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* Retry status */}
      {retryCount > 0 && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <p className="text-yellow-400 text-xs">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="border border-gray-700 rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tweet list */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
        {tweets.map((tweet, index) => {
          const isExpanded = expandedTweets.has(tweet.tweet_id);
          const shouldTruncate = tweet.body.length > 200;
          const displayText =
            isExpanded || !shouldTruncate
              ? tweet.body
              : truncateText(tweet.body);

          return (
            <div
              key={`${tweet.tweet_id}-${index}`}
              className="border border-gray-700 rounded-lg p-4 hover:border-[#00D992]/30 transition-colors group"
            >
              {/* Tweet header */}
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={tweet.profile_image_url}
                  alt={`@${tweet.author_handle}`}
                  className="w-10 h-10 rounded-full ring-2 ring-transparent group-hover:ring-[#00D992]/50 transition-all"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=40&width=40";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-100 text-sm truncate">
                      {getDisplayHandle(tweet.author_handle)}
                    </span>
                    {tweet.sentiment !== null &&
                      getSentimentIcon(tweet.sentiment)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(tweet.tweet_create_time)}
                  </div>
                </div>
              </div>

              {/* Tweet content */}
              <div className="mb-3">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {highlightTokens(displayText)}
                </p>
                {shouldTruncate && (
                  <button
                    onClick={() => toggleTweetExpansion(tweet.tweet_id)}
                    className="text-[#00D992] text-xs hover:text-[#00C484] transition-colors mt-1"
                  >
                    {isExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>

              {/* Tweet category */}
              {tweet.tweet_category && (
                <div className="mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#00D992]/20 text-[#00D992] border border-[#00D992]/30">
                    <Hash className="w-3 h-3 mr-1" />
                    {tweet.tweet_category}
                  </span>
                </div>
              )}

              {/* Tweet metrics */}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatNumber(tweet.view_count)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{formatNumber(tweet.like_count)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{formatNumber(tweet.reply_count)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Repeat2 className="w-3 h-3" />
                  <span>{formatNumber(tweet.retweet_count)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {!loading && tweets.length === 0 && (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            No tweets found for this time period
          </p>
        </div>
      )}
    </div>
  );
}
