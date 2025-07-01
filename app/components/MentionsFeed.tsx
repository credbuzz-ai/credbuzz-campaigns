"use client";

import { CREDBUZZ_API_URL } from "@/lib/constants";
import {
  AtSign,
  ChevronDown,
  Eye,
  Hash,
  Heart,
  MessageCircle,
  Repeat2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MentionsResponse, PaginationInfo, TweetMentionData } from "../types";

interface MentionsFeedProps {
  authorHandle?: string;
}

type Interval = "1day" | "7day" | "30day";
type SortBy =
  | "tweet_create_time_desc"
  | "tweet_create_time_asc"
  | "view_count_desc"
  | "like_count_desc"
  | "retweet_count_desc";

const sortOptions = [
  { value: "tweet_create_time_desc" as SortBy, label: "Latest" },
  { value: "tweet_create_time_asc" as SortBy, label: "Oldest" },
  { value: "view_count_desc" as SortBy, label: "Top Views" },
  { value: "like_count_desc" as SortBy, label: "Most Liked" },
  { value: "retweet_count_desc" as SortBy, label: "Most Shared" },
];

export default function MentionsFeed({
  authorHandle = "eliz883",
}: MentionsFeedProps) {
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  const [tweets, setTweets] = useState<TweetMentionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interval, setInterval] = useState<Interval>("7day");
  const [sortBy, setSortBy] = useState<SortBy>("tweet_create_time_desc");
  const [expandedTweets, setExpandedTweets] = useState<Set<string>>(new Set());
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total_count: 0,
    start: 0,
    limit: 20,
    has_more: false,
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchTweets = async (attempt = 0, start = 0, append = false) => {
    if (!append) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(
        `${CREDBUZZ_API_URL}/tweet/tweets-mentioning-author?author_handle=${authorHandle}&start=${start}&limit=${pagination.limit}&sort_by=${sortBy}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        }
      );

      if (response.ok) {
        const data = (await response.json()) as MentionsResponse;
        if (data.tweets && Array.isArray(data.tweets)) {
          const sanitizedTweets = data.tweets.map((tweet) => ({
            ...tweet,
            view_count: tweet.view_count || 0,
            like_count: tweet.like_count || 0,
            quote_count: tweet.quote_count || 0,
            reply_count: tweet.reply_count || 0,
            retweet_count: tweet.retweet_count || 0,
            sentiment: tweet.sentiment,
            tweet_category: tweet.tweet_category || null,
          })) as TweetMentionData[];

          if (append) {
            setTweets((prev) => [...prev, ...sanitizedTweets]);
          } else {
            setTweets(sanitizedTweets);
          }

          setPagination(data.pagination);
          setRetryCount(0);
        } else {
          throw new Error("Invalid response format");
        }
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error(
        `Failed to fetch mentions (attempt ${attempt + 1}):`,
        error
      );

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        setRetryCount(attempt + 1);
        setError(`Retrying... (${attempt + 1}/${MAX_RETRIES})`);

        setTimeout(() => {
          fetchTweets(attempt + 1, start, append);
        }, delay);
        return;
      }

      setError("Failed to fetch mentions");
      setRetryCount(0);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(() => {
    if (pagination.has_more && !loading) {
      fetchTweets(0, pagination.next_start || 0, true);
    }
  }, [pagination.has_more, loading, pagination.next_start]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore]);

  useEffect(() => {
    fetchTweets();
  }, [sortBy, interval, authorHandle]);

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
      // Create a date object from UTC string
      const date = new Date(dateString + "Z"); // Append 'Z' to ensure UTC parsing
      if (isNaN(date.getTime())) {
        return "now";
      }

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

      if (diffHours < 24) {
        return diffHours === 1 ? "1h" : `${diffHours}h`;
      }
      if (diffDays === 1) return "1d";
      if (diffDays < 7) return `${diffDays}d`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w`;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use system timezone
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
    return sortOptions.find((option) => option.value === sortBy)?.label;
  };

  return (
    <div className="card-trendsage sticky top-8 h-full bg-neutral-900 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AtSign className="w-5 h-5 text-[#00D992]" />
          <h2 className="text-lg font-semibold text-gray-100">Mentions Feed</h2>
          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
            {pagination.total_count}
          </span>
        </div>

        <div className="flex items-start gap-2">
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

      {/* Loading state for initial load */}
      {loading && tweets.length === 0 && (
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
                  <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                  <div className="flex gap-3 mt-3">
                    <div className="h-2 bg-gray-700 rounded w-12"></div>
                    <div className="h-2 bg-gray-700 rounded w-12"></div>
                    <div className="h-2 bg-gray-700 rounded w-12"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tweet list */}
      <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar relative">
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
                      getSentimentIcon(tweet.sentiment || null)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(tweet.tweet_create_time || "")}
                  </div>
                </div>
              </div>

              {/* Tweet content */}
              <div className="mb-3">
                <p className="text-gray-300 text-sm leading-relaxed break-words whitespace-pre-wrap">
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

        {/* Intersection Observer Target */}
        <div ref={observerTarget} className="h-4" aria-hidden="true" />

        {/* Loading indicator at bottom */}
        {loading && tweets.length > 0 && (
          <div className="sticky bottom-0 left-0 right-0 py-4 bg-gradient-to-t from-gray-900 to-transparent">
            <div className="flex items-center justify-center gap-2">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#00D992] border-t-transparent"></div>
              <span className="text-sm text-gray-400">
                Loading more tweets...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {!loading && tweets.length === 0 && (
        <div className="text-center py-8">
          <AtSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            No mentions found for @{authorHandle}
          </p>
        </div>
      )}
    </div>
  );
}
