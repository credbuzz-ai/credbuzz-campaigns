"use client";

import KOLSearch from "@/components/KOLSearch";
import { useEffect, useState } from "react";
import { Tweet, TweetFeedResponse } from "./raids/RaidsInterfaces";
import { RaidsResponsePanel } from "./raids/RaidsResponsePanel";
import { RaidsTweetCard } from "./raids/RaidsTweetCard";

interface MentionsFeedProps {
  authorHandle?: string;
  paymentToken?: string;
  targetXHandle?: string;
  onAuthorSelect?: (handle: string) => void;
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
  paymentToken,
  targetXHandle: initialTargetXHandle,
  onAuthorSelect,
}: MentionsFeedProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [interval, setInterval] = useState<Interval>("7day");
  const [sortBy, setSortBy] = useState<SortBy>("tweet_create_time_desc");
  const [tweetFeedType, setTweetFeedType] = useState<
    "both" | "original" | "mentions"
  >("both");
  const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);
  const [llmResponse, setLlmResponse] = useState("");
  const [editedResponse, setEditedResponse] = useState("");
  const [llmLoading, setLlmLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedShareUrl, setGeneratedShareUrl] = useState("");
  const [responseType, setResponseType] = useState("supportive");
  const [tone, setTone] = useState("enthusiastic");
  const [tweetFeedData, setTweetFeedData] = useState<{
    original_tweets: Tweet[];
    mentions: Tweet[];
  }>({
    original_tweets: [],
    mentions: [],
  });
  const [pagination, setPagination] = useState<{
    start: number;
    limit: number;
    has_more: boolean;
    next_start: number;
  }>({
    start: 0,
    limit: 20,
    has_more: false,
    next_start: 0,
  });
  const [targetXHandle, setTargetXHandle] = useState(initialTargetXHandle);
  const [isSearching, setIsSearching] = useState(false);

  const fetchTweetFeed = async ({
    isLoadMore = false,
    symbol,
    twitter_handle,
  }: {
    isLoadMore?: boolean;
    symbol?: string;
    twitter_handle?: string;
  }) => {
    try {
      setLoading(true);
      console.log("Fetching tweets for:", {
        paymentToken,
        targetXHandle,
        isLoadMore,
      });
      const params = new URLSearchParams();

      // Always pass symbol if available (for mentions) - use paymentToken as fallback
      if (paymentToken) {
        params.append("symbol", paymentToken);
      }

      // Pass twitter_handle if available (for original tweets) - use targetXHandle as fallback
      if (targetXHandle) {
        params.append("twitter_handle", targetXHandle.replace("@", ""));
      }

      // If we have neither, we can't fetch tweets
      if (!paymentToken && !targetXHandle) {
        setLoading(false);
        return;
      }

      params.append("feed_type", tweetFeedType);
      params.append("limit", "20");
      params.append("sort_by", sortBy);

      if (isLoadMore && pagination.next_start) {
        params.append("start", String(pagination.next_start));
      } else {
        params.append("start", "0");
      }

      const url = `/api/raids/tweet-feed?${params.toString()}`;
      console.log("Fetching from URL:", url);
      const response = await fetch(url);

      if (response.ok) {
        const data: TweetFeedResponse = await response.json();
        console.log("Tweet feed response:", {
          originalTweets: data.result.original_tweets.length,
          mentions: data.result.mentions.length,
          pagination: data.result.pagination,
          paymentToken,
          targetXHandle,
          isLoadMore,
        });

        // Update tweet feed data
        setTweetFeedData((prevData) => ({
          original_tweets: isLoadMore
            ? [...prevData.original_tweets, ...data.result.original_tweets]
            : data.result.original_tweets,
          mentions: isLoadMore
            ? [...prevData.mentions, ...data.result.mentions]
            : data.result.mentions,
        }));

        // Update pagination state
        setPagination(data.result.pagination);
        setLoading(false);
        setError(null);
      } else {
        console.log("Failed to fetch tweets");
        setError("Failed to fetch tweets");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching tweets:", error);
      setError("Error fetching tweets");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentToken || targetXHandle) {
      setLoading(true);
      fetchTweetFeed({
        symbol: paymentToken,
        twitter_handle: targetXHandle?.replace("@", ""),
        isLoadMore: false,
      }).finally(() => {
        setLoading(false);
        setIsSearching(false);
      });
    }
  }, [paymentToken, targetXHandle, sortBy, interval, tweetFeedType]);

  // Add debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter tweets based on search term
  const filterTweets = (tweets: Tweet[]) => {
    if (!debouncedSearchTerm) return tweets;
    const searchLower = debouncedSearchTerm.toLowerCase();
    return tweets.filter(
      (tweet) =>
        tweet.body.toLowerCase().includes(searchLower) ||
        tweet.author_handle.toLowerCase().includes(searchLower)
    );
  };

  const handleGenerateResponse = async (tweet: Tweet) => {
    setSelectedTweet(tweet);
    setLlmLoading(true);
    setLlmResponse("");
    setEditedResponse("");
    try {
      const requestBody = {
        tweet_content: tweet.body,
        tweet_context: {
          author_handle: tweet.author_handle,
          symbol: paymentToken,
          sentiment: tweet.sentiment,
          tweet_category: tweet.tweet_category,
        },
        response_type: responseType,
        tone: tone,
      };

      const response = await fetch(`/api/raids/generate-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setLlmResponse(data.result.response_text);
        setEditedResponse(data.result.response_text);
      } else {
        setLlmResponse("Failed to generate response.");
        setEditedResponse("");
      }
    } catch (error) {
      setLlmResponse("Failed to generate response.");
      setEditedResponse("");
    } finally {
      setLlmLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setImageLoading(true);
    try {
      const response = await fetch(`/api/raids/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tweet_content: selectedTweet?.body,
          response_text: editedResponse,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedShareUrl(data.result.share_url);
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleCopyImage = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const handlePostToTwitter = () => {
    if (selectedTweet) {
      const tweetText = encodeURIComponent(editedResponse);
      const tweetUrl = `https://twitter.com/intent/tweet?in_reply_to=${selectedTweet.tweet_id}&text=${tweetText}`;
      window.open(tweetUrl, "_blank");
    }
  };

  const handleLikeIntent = (tweet: Tweet) => {
    window.open(
      `https://twitter.com/intent/like?tweet_id=${tweet.tweet_id}`,
      "_blank"
    );
  };

  const handleRetweetIntent = (tweet: Tweet) => {
    window.open(
      `https://twitter.com/intent/retweet?tweet_id=${tweet.tweet_id}`,
      "_blank"
    );
  };

  const handleAuthorSelect = (handle: string) => {
    if (onAuthorSelect) {
      onAuthorSelect(handle);
    }
    // Update the targetXHandle state and show loading
    setIsSearching(true);
    setTargetXHandle(handle);
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-hidden">
      {/* Tweet feed and response panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-4 h-full">
        {/* Tweet feed */}
        <div className="h-full flex flex-col overflow-hidden">
          {/* Controls - Fixed height */}
          <div className="flex-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 p-4">
            {/* Feed Type Toggle */}
            <div className="flex gap-2 bg-neutral-800 rounded-lg p-1">
              {[
                { value: "both", label: "All" },
                { value: "original", label: "Project Tweets" },
                { value: "mentions", label: "Mentions" },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() =>
                    setTweetFeedType(
                      type.value as "both" | "original" | "mentions"
                    )
                  }
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    tweetFeedType === type.value
                      ? "bg-neutral-700 text-white"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Sort and Time Controls */}
            <div className="flex gap-4 w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-2 text-sm flex-1 sm:flex-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-1 bg-neutral-800 rounded-lg p-1">
                {["1day", "7day", "30day"].map((int) => (
                  <button
                    key={int}
                    onClick={() => setInterval(int as Interval)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      interval === int
                        ? "bg-neutral-700 text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {int === "1day" ? "24H" : int.replace("day", "D")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tweet feed content - Scrollable */}
          <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
            {loading &&
            !tweetFeedData.original_tweets.length &&
            !tweetFeedData.mentions.length ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-400"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <>
                {/* Original tweets section */}
                {(tweetFeedType === "both" || tweetFeedType === "original") &&
                  filterTweets(tweetFeedData.original_tweets).map((tweet) => (
                    <RaidsTweetCard
                      key={tweet.tweet_id}
                      tweet={tweet}
                      isSelected={selectedTweet?.tweet_id === tweet.tweet_id}
                      tweetFeedType={tweetFeedType}
                      originalTweets={tweetFeedData.original_tweets}
                      onGenerateResponse={handleGenerateResponse}
                      onLikeIntent={handleLikeIntent}
                      onRetweetIntent={handleRetweetIntent}
                    />
                  ))}

                {/* Mentions section */}
                {(tweetFeedType === "both" || tweetFeedType === "mentions") &&
                  filterTweets(tweetFeedData.mentions).map((tweet) => (
                    <RaidsTweetCard
                      key={tweet.tweet_id}
                      tweet={tweet}
                      isSelected={selectedTweet?.tweet_id === tweet.tweet_id}
                      tweetFeedType={tweetFeedType}
                      originalTweets={tweetFeedData.original_tweets}
                      onGenerateResponse={handleGenerateResponse}
                      onLikeIntent={handleLikeIntent}
                      onRetweetIntent={handleRetweetIntent}
                    />
                  ))}

                {/* Load more button */}
                {pagination.has_more && !loading && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => fetchTweetFeed({ isLoadMore: true })}
                      className="px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-600 transition-colors"
                    >
                      Load More
                    </button>
                  </div>
                )}

                {/* Loading more indicator */}
                {loading &&
                  (tweetFeedData.original_tweets.length > 0 ||
                    tweetFeedData.mentions.length > 0) && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-neutral-400"></div>
                    </div>
                  )}

                {/* Empty state */}
                {!loading &&
                  filterTweets(tweetFeedData.original_tweets).length === 0 &&
                  filterTweets(tweetFeedData.mentions).length === 0 && (
                    <div className="text-center py-8 text-neutral-400">
                      {debouncedSearchTerm
                        ? `No tweets found for "${debouncedSearchTerm}"`
                        : "No tweets found"}
                    </div>
                  )}
              </>
            )}
          </div>
        </div>

        {/* Response panel */}
        <div className="h-full flex flex-col overflow-hidden">
          {/* KOL Search - Fixed height */}
          <div className="flex-none p-4">
            <KOLSearch
              onSelect={handleAuthorSelect}
              navigateOnSelect={false}
              placeholder="Search for a Twitter handle..."
            />
            {isSearching && (
              <div className="mt-2 text-sm text-gray-400 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#00D992]"></div>
                Loading tweets...
              </div>
            )}
          </div>

          {/* Response panel content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <RaidsResponsePanel
              selectedTweet={selectedTweet}
              llmResponse={llmResponse}
              editedResponse={editedResponse}
              llmLoading={llmLoading}
              imageLoading={imageLoading}
              generatedShareUrl={generatedShareUrl}
              responseType={responseType}
              tone={tone}
              onResponseTypeChange={setResponseType}
              onToneChange={setTone}
              onEditedResponseChange={setEditedResponse}
              onGenerateImage={handleGenerateImage}
              onCopyImage={handleCopyImage}
              onPostToTwitter={handlePostToTwitter}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #262626;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #525252;
        }
      `}</style>
    </div>
  );
}
