"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Filter,
  Search,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  AuthorDetailsFullResponse,
  GenerateResponseRequest,
  GenerateResponseResponse,
  HandleDetails,
  LeftSectionItem,
  SearchResultsResponse,
  SearchToken,
  TokenDetails,
  TrendingToken,
  TrendingTokensResponse,
  Tweet,
  TweetFeedResponse,
} from "../components/raids/RaidsInterfaces";
import { RaidsLeftPanel } from "../components/raids/RaidsLeftPanel";
import { RaidsResponsePanel } from "../components/raids/RaidsResponsePanel";
import { RaidsTargetInput } from "../components/raids/RaidsTargetInput";
import { RaidsTokenDetails } from "../components/raids/RaidsTokenDetails";
import { RaidsTweetCard } from "../components/raids/RaidsTweetCard";
import { formatNumber } from "../components/raids/RaidsUtils";

export default function RaidsPage() {
  const { toast } = useToast();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [searchResults, setSearchResults] = useState<SearchToken[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LeftSectionItem | null>(
    null
  );
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [handleDetails, setHandleDetails] = useState<HandleDetails | null>(
    null
  );
  const [originalTweets, setOriginalTweets] = useState<Tweet[]>([]);
  const [mentions, setMentions] = useState<Tweet[]>([]);
  const [loadingTrendingTokens, setLoadingTrendingTokens] = useState(true);
  const [loadingTokenDetails, setLoadingTokenDetails] = useState(true);
  const [loadingTweets, setLoadingTweets] = useState(true);
  const [loadingAuthorDetails, setLoadingAuthorDetails] = useState(true);
  const [tweetFeedType, setTweetFeedType] = useState<
    "both" | "original" | "mentions"
  >("both");
  const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);
  const [llmResponse, setLlmResponse] = useState<string>("");
  const [editedResponse, setEditedResponse] = useState<string>("");
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmIntentUrl, setLlmIntentUrl] = useState<string>("");
  const [generatedShareUrl, setGeneratedShareUrl] = useState<string>("");
  const [generatedHtmlUrl, setGeneratedHtmlUrl] = useState<string>("");
  const [imageLoading, setImageLoading] = useState(false);

  // Chain filter state
  const [selectedChains, setSelectedChains] = useState<string[]>([
    "solana",
    "base",
    "ethereum",
    "bsc",
  ]);
  const [availableChains, setAvailableChains] = useState<string[]>([
    "solana",
    "base",
    "ethereum",
    "bsc",
  ]);

  // Raid target state
  const [raidTarget, setRaidTarget] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("raidTarget") || "";
    }
    return "";
  });
  const [isRaidTargetLocked, setIsRaidTargetLocked] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isRaidTargetLocked") === "true";
    }
    return false;
  });

  // Raid target search state
  const [raidTargetSearchTerm, setRaidTargetSearchTerm] = useState("");
  const [debouncedRaidTargetSearchTerm, setDebouncedRaidTargetSearchTerm] =
    useState("");
  const [raidTargetSearchResults, setRaidTargetSearchResults] = useState<
    SearchToken[]
  >([]);
  const [isRaidTargetSearching, setIsRaidTargetSearching] = useState(false);
  const [showRaidTargetDropdown, setShowRaidTargetDropdown] = useState(false);

  // Response customization state
  const [responseType, setResponseType] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("responseType") || "supportive";
    }
    return "supportive";
  });
  const [tone, setTone] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tone") || "enthusiastic";
    }
    return "enthusiastic";
  });

  // Mobile responsive state
  const [mobileView, setMobileView] = useState<"tokens" | "detail">("tokens");

  // Pagination state for lazy loading tweets
  const [tweetPagination, setTweetPagination] = useState({
    start: 0,
    limit: 20,
    hasMore: true,
    nextStart: 0,
  });
  const [loadingMoreTweets, setLoadingMoreTweets] = useState(false);

  // Wrapper functions to update both state and localStorage
  const updateRaidTarget = (value: string) => {
    setRaidTarget(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("raidTarget", value);
    }
  };

  const updateIsRaidTargetLocked = (value: boolean) => {
    setIsRaidTargetLocked(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("isRaidTargetLocked", value.toString());
    }
  };

  const updateResponseType = (value: string) => {
    setResponseType(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("responseType", value);
    }
  };

  const updateTone = (value: string) => {
    setTone(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("tone", value);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce raid target search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRaidTargetSearchTerm(raidTargetSearchTerm);
    }, 300); // 300ms delay for faster response

    return () => clearTimeout(timer);
  }, [raidTargetSearchTerm]);

  // Fetch trending tokens on mount
  useEffect(() => {
    fetchTrendingTokens();
  }, []);

  // When trending tokens are loaded, select the first token by default
  useEffect(() => {
    if (trendingTokens.length > 0 && !selectedItem && !isSearching) {
      setSelectedItem(trendingTokens[0]);
    }
  }, [trendingTokens, isSearching, selectedItem]);

  // When selectedItem changes, fetch its details and tweets
  useEffect(() => {
    if (selectedItem) {
      console.log(
        "Selected item changed:",
        selectedItem.symbol,
        selectedItem.twitter_final
      );
      // Clear tweets immediately when switching items
      setOriginalTweets([]);
      setMentions([]);
      setLoadingTokenDetails(true);
      setLoadingTweets(true);

      // For tokens, we always have a symbol, and may have a twitter_handle
      const symbol = selectedItem.symbol;
      const twitter_handle = selectedItem.twitter_final || undefined;

      // Always set up token details as fallback first
      const fallbackTokenDetails: TokenDetails = {
        token_id: selectedItem.token_id,
        symbol: selectedItem.symbol,
        name: selectedItem.name,
        chain: selectedItem.chain,
        twitter_final: selectedItem.twitter_final || "",
        profile_image_url: selectedItem.profile_image_url || "",
        twitter_bio: "",
        website_final: "",
        telegram_final: "",
        mention_count_24hr:
          (selectedItem as any).mention_count_24hr ??
          (selectedItem as any).mention_count ??
          0,
        total_accounts_24hr:
          (selectedItem as any).total_accounts_24hr ??
          (selectedItem as any).total_accounts ??
          0,
        influencer_count_24hr:
          (selectedItem as any).influencer_count_24hr ??
          (selectedItem as any).influencer_count ??
          0,
        marketcap: selectedItem.marketcap ?? 0,
        volume_24hr:
          "volume_24hr" in selectedItem
            ? (selectedItem as any).volume_24hr ?? 0
            : 0,
        pc_24_hr:
          "pc_24_hr" in selectedItem ? (selectedItem as any).pc_24_hr ?? 0 : 0,
        narrative:
          "narrative" in selectedItem
            ? (selectedItem as any).narrative ?? ""
            : "",
      };

      // Set token details immediately as fallback
      setTokenDetails(fallbackTokenDetails);
      setHandleDetails(null);
      setLoadingTokenDetails(false); // Token details are ready

      if (twitter_handle) {
        // Try to fetch additional author details, but don't clear token details if it fails
        fetchAuthorDetails(twitter_handle);
      }

      // Single API call for tweets - pass both symbol and handle if available
      fetchTweetFeed({ symbol, twitter_handle });

      // Reset to "both" when switching items
      setTweetFeedType("both");
      setSelectedTweet(null);
      setLlmResponse("");
      setEditedResponse("");
      setLlmIntentUrl("");
      setGeneratedShareUrl("");
      setGeneratedHtmlUrl("");

      // Reset raid target when switching items (unless locked)
      if (!isRaidTargetLocked) {
        updateRaidTarget("");
      }

      // Reset response customization to defaults
      updateResponseType("supportive");
      updateTone("enthusiastic");

      // Reset pagination for new item
      setTweetPagination({
        start: 0,
        limit: 20,
        hasMore: true,
        nextStart: 0,
      });
    } else {
      // Clear everything when no item is selected
      setOriginalTweets([]);
      setMentions([]);
      setTokenDetails(null);
      setHandleDetails(null);
      setLoadingTokenDetails(false);
      setLoadingTweets(false);
      setLoadingAuthorDetails(false);
      setSelectedTweet(null);
      setLlmResponse("");
      setEditedResponse("");
      setLlmIntentUrl("");
      setGeneratedShareUrl("");
      setGeneratedHtmlUrl("");

      // Reset raid target when clearing selection (unless locked)
      if (!isRaidTargetLocked) {
        updateRaidTarget("");
      }

      // Reset response customization to defaults
      updateResponseType("supportive");
      updateTone("enthusiastic");
    }
  }, [selectedItem]);

  // Search effect - now uses debounced search term and minimum 2 characters
  useEffect(() => {
    if (debouncedSearchTerm.trim().length >= 2) {
      setIsSearching(true);
      fetchSearchResults();
    } else if (debouncedSearchTerm.trim().length === 0) {
      setIsSearching(false);
      setSearchResults([]);
      setSelectedItem(null);
    }
  }, [debouncedSearchTerm]);

  // Raid target search effect
  useEffect(() => {
    if (debouncedRaidTargetSearchTerm.trim().length >= 2) {
      setIsRaidTargetSearching(true);
      fetchRaidTargetSearchResults();
    } else if (debouncedRaidTargetSearchTerm.trim().length === 0) {
      setRaidTargetSearchResults([]);
      setIsRaidTargetSearching(false);
    }
  }, [debouncedRaidTargetSearchTerm]);

  // API calls
  const fetchTrendingTokens = async () => {
    try {
      setLoadingTrendingTokens(true);
      const response = await fetch(
        `/api/raids/trending-tokens?limit=30&timeframe=1hr`
      );
      if (response.ok) {
        const data: TrendingTokensResponse = await response.json();
        setTrendingTokens(data.result || []);

        // Extract unique chains from trending tokens
        const chains = [
          ...new Set(
            data.result?.map((token: TrendingToken) => token.chain) || []
          ),
        ];
        setAvailableChains(chains);

        // Initialize selected chains to default chains (BSC, Base, Solana, ETH)
        if (chains.length > 0 && selectedChains.length === 0) {
          const defaultChains = ["BSC", "BASE", "SOL", "ETH"];
          // Always set the default chains, even if they're not in the current data
          setSelectedChains(defaultChains);
        }
      } else {
        setTrendingTokens([]);
        setAvailableChains([]);
      }
    } catch (error) {
      setTrendingTokens([]);
      setAvailableChains([]);
    } finally {
      setLoadingTrendingTokens(false);
    }
  };

  const fetchSearchResults = async () => {
    try {
      setLoadingTrendingTokens(true);
      const response = await fetch(
        `/api/raids/search?search_term=${encodeURIComponent(
          debouncedSearchTerm
        )}&limit=20`
      );
      if (response.ok) {
        const data: SearchResultsResponse = await response.json();
        setSearchResults(data.result || []);

        // Extract unique chains from search results and merge with existing available chains
        const searchChains = [
          ...new Set(
            data.result?.map((token: SearchToken) => token.chain) || []
          ),
        ];
        setAvailableChains((prev) => {
          const allChains = [...new Set([...prev, ...searchChains])];
          // If we have no chains selected, select default chains
          if (selectedChains.length === 0) {
            const defaultChains = ["BSC", "BASE", "SOL", "ETH"];
            setSelectedChains(defaultChains);
          }
          return allChains;
        });
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setLoadingTrendingTokens(false);
    }
  };

  const fetchRaidTargetSearchResults = async () => {
    try {
      const response = await fetch(
        `/api/raids/search?search_term=${encodeURIComponent(
          debouncedRaidTargetSearchTerm
        )}&limit=10`
      );
      if (response.ok) {
        const data: SearchResultsResponse = await response.json();
        setRaidTargetSearchResults(data.result || []);
      } else {
        setRaidTargetSearchResults([]);
      }
    } catch (error) {
      setRaidTargetSearchResults([]);
    } finally {
      setIsRaidTargetSearching(false);
    }
  };

  const fetchAuthorDetails = async (handle: string) => {
    try {
      setLoadingAuthorDetails(true);
      const response = await fetch(
        `/api/raids/author-details/${encodeURIComponent(handle)}`
      );
      if (response.ok) {
        const data: AuthorDetailsFullResponse = await response.json();
        setHandleDetails(data.result.handle);

        // If we get token data from the API, merge it with existing token details
        if (data.result.token) {
          setTokenDetails((prevTokenDetails: TokenDetails | null) => {
            if (!prevTokenDetails) return data.result.token || null;

            return data.result.token
              ? {
                  ...prevTokenDetails,
                  ...data.result.token,
                  // Keep existing values if API doesn't provide them
                  token_id:
                    data.result.token.token_id || prevTokenDetails.token_id,
                  symbol: data.result.token.symbol || prevTokenDetails.symbol,
                  name: data.result.token.name || prevTokenDetails.name,
                  chain: data.result.token.chain || prevTokenDetails.chain,
                  profile_image_url:
                    data.result.token.profile_image_url ||
                    prevTokenDetails.profile_image_url,
                }
              : prevTokenDetails;
          });
        }
      } else {
        // If API fails, keep existing token info and just log the warning
        console.warn(
          `Failed to fetch author details for ${handle}, keeping existing token info`
        );
        setHandleDetails(null);
        // Switch to both (will show mentions since original tweets won't be available)
        setTweetFeedType("both");
      }
    } catch (error) {
      // If API fails, keep existing token info and just log the error
      console.warn(
        `Error fetching author details for ${handle}, keeping existing token info:`,
        error
      );
      setHandleDetails(null);
      // Switch to both (will show mentions since original tweets won't be available)
      setTweetFeedType("both");
    } finally {
      setLoadingAuthorDetails(false);
    }
  };

  const fetchTweetFeed = async ({
    symbol,
    twitter_handle,
    isLoadMore = false,
  }: {
    symbol?: string;
    twitter_handle?: string;
    isLoadMore?: boolean;
  }) => {
    try {
      if (isLoadMore) {
        setLoadingMoreTweets(true);
      } else {
        setLoadingTweets(true);
      }

      console.log("Fetching tweets for:", {
        symbol,
        twitter_handle,
        isLoadMore,
      });
      const params = new URLSearchParams();

      // Always pass symbol if available (for mentions)
      if (symbol) {
        params.append("symbol", symbol);
      }

      // Pass twitter_handle if available (for original tweets)
      if (twitter_handle) {
        params.append("twitter_handle", twitter_handle);
      }

      // If we have neither, we can't fetch tweets
      if (!symbol && !twitter_handle) {
        setOriginalTweets([]);
        setMentions([]);
        setLoadingTweets(false);
        setLoadingMoreTweets(false);
        return;
      }

      params.append("feed_type", "both");
      params.append("limit", tweetPagination.limit.toString());

      if (isLoadMore) {
        params.append("start", tweetPagination.nextStart.toString());
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
          symbol,
          twitter_handle,
          isLoadMore,
        });

        if (isLoadMore) {
          // Append new tweets to existing ones
          setOriginalTweets((prev) => [
            ...prev,
            ...data.result.original_tweets,
          ]);
          setMentions((prev) => [...prev, ...data.result.mentions]);
        } else {
          // Replace tweets for new selection
          setOriginalTweets(data.result.original_tweets);
          setMentions(data.result.mentions);
        }

        // Update pagination state
        setTweetPagination({
          start: data.result.pagination.start,
          limit: data.result.pagination.limit,
          hasMore: data.result.pagination.has_more,
          nextStart: data.result.pagination.next_start,
        });
      } else {
        console.log("Failed to fetch tweets");
        if (!isLoadMore) {
          setOriginalTweets([]);
          setMentions([]);
        }
      }
    } catch (error) {
      console.error("Error fetching tweets:", error);
      if (!isLoadMore) {
        setOriginalTweets([]);
        setMentions([]);
      }
    } finally {
      setLoadingTweets(false);
      setLoadingMoreTweets(false);
    }
  };

  const handleGenerateResponse = async (tweet: Tweet) => {
    setSelectedTweet(tweet);
    setLlmLoading(true);
    setLlmResponse("");
    setEditedResponse("");
    setLlmIntentUrl("");
    try {
      const selectedSymbol =
        selectedItem && "symbol" in selectedItem ? selectedItem.symbol : "";
      // Use raid target if specified, otherwise use selected community symbol
      const raidTargetSymbol = raidTarget.trim() || selectedSymbol;

      const requestBody: GenerateResponseRequest = {
        tweet_content: tweet.body,
        tweet_context: {
          author_handle: tweet.author_handle,
          symbol: raidTargetSymbol,
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
        const data: GenerateResponseResponse = await response.json();
        setLlmResponse(data.result.response_text);
        setEditedResponse(data.result.response_text);
        setLlmIntentUrl(data.result.twitter_intent_url);
      } else {
        setLlmResponse("Failed to generate response.");
        setEditedResponse("");
        setLlmIntentUrl("");
      }
    } catch (error) {
      setLlmResponse("Failed to generate response.");
      setEditedResponse("");
      setLlmIntentUrl("");
    } finally {
      setLlmLoading(false);
    }
  };

  const generateRaidImage = async () => {
    if (!selectedItem || !editedResponse || !selectedTweet) return;

    setImageLoading(true);
    try {
      // Determine response type and tone based on sentiment and content
      const determineResponseType = (sentiment: number, content: string) => {
        if (sentiment > 0.5) return "supportive";
        if (sentiment < -0.5) return "critical";
        return "neutral";
      };

      const determineTone = (content: string) => {
        const lowerContent = content.toLowerCase();
        if (
          lowerContent.includes("🚀") ||
          lowerContent.includes("moon") ||
          lowerContent.includes("pump")
        )
          return "enthusiastic";
        if (
          lowerContent.includes("💎") ||
          lowerContent.includes("hodl") ||
          lowerContent.includes("diamond")
        )
          return "confident";
        if (
          lowerContent.includes("🔥") ||
          lowerContent.includes("fire") ||
          lowerContent.includes("hot")
        )
          return "excited";
        if (
          lowerContent.includes("😱") ||
          lowerContent.includes("wow") ||
          lowerContent.includes("amazing")
        )
          return "surprised";
        return "enthusiastic"; // default
      };

      const responseType = determineResponseType(
        selectedTweet.sentiment,
        editedResponse
      );
      const tone = determineTone(editedResponse);

      // Use raid target if specified, otherwise use selected community symbol
      const raidTargetSymbol = raidTarget.trim() || selectedItem.symbol;

      // Call the AI image generation API
      const response = await fetch(`/api/raids/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `A dynamic crypto raid response image featuring ${raidTargetSymbol} token on ${
            selectedItem.chain
          } blockchain. The image should represent a ${tone} ${responseType} response to a tweet about ${raidTargetSymbol}. Show crypto trading charts, rocket emojis, and a futuristic trading interface with ${raidTargetSymbol} prominently displayed. The mood should reflect: ${editedResponse.substring(
            0,
            100
          )}...`,
          style: "realistic",
          aspect_ratio: "16:9",
          token_symbol: raidTargetSymbol,
          author_handle: selectedTweet.author_handle,
          original_tweet_content: selectedTweet.body,
          ai_response_content: editedResponse,
          tweet_author_handle: selectedTweet.author_handle,
          response_type: responseType,
          tone: tone,
        }),
      });

      const data = await response.json();

      if (data.result && data.result.image_url && data.result.html_url) {
        setGeneratedShareUrl(data.result.image_url); // Use image URL for preview
        setGeneratedHtmlUrl(data.result.html_url); // Use HTML URL for sharing
        console.log(
          "AI image and HTML page generated successfully:",
          data.result.image_url
        );
      } else {
        console.error("Failed to generate image:", data.message);
        // Fallback to static image if API fails
        setGeneratedShareUrl(
          "https://dhowgvd18tbhl.cloudfront.net/raid-images/grokbanner.jpeg"
        );
        setGeneratedHtmlUrl("");
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
      // Fallback to static image if API fails
      setGeneratedShareUrl(
        "https://dhowgvd18tbhl.cloudfront.net/raid-images/grokbanner.jpeg"
      );
      setGeneratedHtmlUrl("");
    } finally {
      setImageLoading(false);
    }
  };

  const handlePostToTwitter = async () => {
    if (!selectedTweet || !editedResponse) return;

    // First, copy the generated image to clipboard if available
    if (generatedShareUrl) {
      try {
        const response = await fetch(generatedShareUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
      } catch (error) {
        console.error("Failed to copy image:", error);
      }
    }

    let tweetText = editedResponse;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&in_reply_to=${selectedTweet.tweet_id}`;
    window.open(url, "_blank");
  };

  const handleLikeIntent = (tweet: Tweet) => {
    const url = `https://twitter.com/intent/like?tweet_id=${tweet.tweet_id}`;
    window.open(url, "_blank");
  };

  const handleRetweetIntent = (tweet: Tweet) => {
    const url = `https://twitter.com/intent/retweet?tweet_id=${tweet.tweet_id}`;
    window.open(url, "_blank");
  };

  const handleTokenIdCopy = async (tokenId: string) => {
    try {
      await navigator.clipboard.writeText(tokenId);
      toast({
        title: "Token ID copied!",
        description: "The token ID has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Failed to copy token ID:", error);
      toast({
        title: "Failed to copy token ID",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Mobile handlers
  const handleMobileTokenSelect = (item: LeftSectionItem) => {
    setSelectedItem(item);
    setMobileView("detail");
  };

  const handleMobileBackToTokens = () => {
    setMobileView("tokens");
  };

  const handleRaidTargetSelect = (item: SearchToken) => {
    const target = item.twitter_final
      ? `@${item.twitter_final}`
      : `$${item.symbol}`;
    updateRaidTarget(target);
    setRaidTargetSearchTerm("");
    setShowRaidTargetDropdown(false);
    setRaidTargetSearchResults([]);
  };

  // Memoized values
  const uniqueTweets = useMemo(() => {
    const tweetsToShow =
      tweetFeedType === "original"
        ? originalTweets
        : tweetFeedType === "mentions"
        ? mentions
        : [...originalTweets, ...mentions];

    return tweetsToShow
      .filter(
        (tweet, index, self) =>
          index === self.findIndex((t) => t.tweet_id === tweet.tweet_id)
      )
      .sort((a, b) => {
        const dateA = new Date(a.tweet_create_time + "Z").getTime();
        const dateB = new Date(b.tweet_create_time + "Z").getTime();
        return dateB - dateA; // Latest first
      });
  }, [tweetFeedType, originalTweets, mentions]);

  const filteredItems = useMemo(() => {
    if (isSearching) {
      return searchResults;
    }
    return trendingTokens;
  }, [isSearching, searchResults, trendingTokens]);

  return (
    <div className="bg-[url('/landingPageBg.png')] bg-cover bg-no-repeat pt-20 md:pt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 h-[calc(100vh-8rem)]">
        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col h-full">
          {mobileView === "tokens" ? (
            /* Mobile Tokens View */
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="mb-6 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    {isSearching ? (
                      <>
                        <Search className="w-5 h-5 text-[#00D992]" />
                        Search Results
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5 text-[#00D992]" />
                        Trending Communities
                      </>
                    )}
                  </h2>
                  {filteredItems.length > 0 && (
                    <span className="text-xs text-gray-400">
                      {filteredItems.length} result
                      {filteredItems.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Search Bar */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search tokens or handles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 text-sm bg-neutral-800 border-neutral-600 text-white placeholder-gray-400 focus:border-[#00D992] focus:ring-[#00D992] rounded-none"
                  />
                </div>

                {/* Chain Filter */}
                {availableChains.length > 0 && (
                  <div className="mb-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-neutral-800 border-neutral-600 text-white hover:border-[#00D992] hover:text-[#000000] rounded-none"
                        >
                          <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm">
                              {selectedChains.length === availableChains.length
                                ? "All Chains"
                                : selectedChains.length === 0
                                ? "All Chains"
                                : `${selectedChains.length} Chain${
                                    selectedChains.length !== 1 ? "s" : ""
                                  } Selected`}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 bg-neutral-800 border-neutral-600 text-white">
                        <DropdownMenuCheckboxItem
                          checked={
                            selectedChains.length === availableChains.length
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedChains(availableChains);
                            } else {
                              setSelectedChains([]);
                            }
                          }}
                          className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                        >
                          {selectedChains.length === availableChains.length
                            ? "Deselect All"
                            : "Select All"}
                        </DropdownMenuCheckboxItem>

                        <DropdownMenuSeparator className="bg-neutral-600" />

                        {availableChains.map((chain) => (
                          <DropdownMenuCheckboxItem
                            key={chain}
                            checked={selectedChains.includes(chain)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedChains((prev) => [...prev, chain]);
                              } else {
                                setSelectedChains((prev) =>
                                  prev.filter((c) => c !== chain)
                                );
                              }
                            }}
                            className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                          >
                            {chain}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              {/* Tokens List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                {loadingTrendingTokens ? (
                  <div className="space-y-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-none"
                      >
                        <Skeleton className="w-10 h-16 rounded-full" />
                      </Skeleton>
                    ))}
                  </div>
                ) : filteredItems.length > 0 ? (
                  <ul className="space-y-1">
                    {filteredItems.map((item, index) => (
                      <div
                        key={`mobile-${item.token_id || index}`}
                        className={`w-full flex items-center gap-3 p-3 rounded-none transition-all text-left hover:bg-neutral-800 border-2 border-transparent hover:border-neutral-600 cursor-pointer`}
                        onClick={() => handleMobileTokenSelect(item)}
                      >
                        <img
                          src={item.profile_image_url || "/placeholder.svg"}
                          alt={item.symbol}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate text-white">
                              {item.symbol}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTokenIdCopy(item.token_id);
                              }}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-[#00D992] hover:bg-[#00D992]/10"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-xs text-gray-400 truncate block">
                            {item.name}
                          </span>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-1 min-w-0">
                            <span className="truncate">
                              Mentions:{" "}
                              {formatNumber(
                                ("mention_count_24hr" in item
                                  ? item.mention_count_24hr
                                  : item.mention_count) || 0
                              )}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs bg-neutral-700 border-neutral-500 text-gray-300 shrink-0 ml-2"
                            >
                              {item.chain}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    {isSearching
                      ? "No search results found."
                      : "No tokens found matching the current filters."}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Mobile Detail View */
            <div className="flex flex-col h-full">
              {/* Back Button */}
              <div className="mb-4">
                <Button
                  variant="ghost"
                  onClick={handleMobileBackToTokens}
                  className="text-gray-400 hover:text-white flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Communities
                </Button>
              </div>

              {/* Detail Content */}
              <div
                className={`flex-1 overflow-y-auto tweet-feed-container ${
                  selectedTweet ? "pb-48" : ""
                }`}
              >
                {loadingAuthorDetails || loadingTokenDetails ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-64 mb-2" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Token Details */}
                    <RaidsTokenDetails
                      tokenDetails={tokenDetails}
                      handleDetails={handleDetails}
                      onTokenIdCopy={handleTokenIdCopy}
                    />

                    {/* Tweet Feed */}
                    <div className="space-y-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4">
                          <div className="flex bg-neutral-800 border border-neutral-600 rounded-none">
                            <button
                              onClick={() => {
                                setTweetFeedType("both");
                                setSelectedTweet(null);
                                setLlmResponse("");
                                setEditedResponse("");
                                setLlmIntentUrl("");
                                if (!isRaidTargetLocked) {
                                  updateRaidTarget("");
                                }
                                updateResponseType("supportive");
                                updateTone("enthusiastic");
                              }}
                              className={`px-3 py-2 text-xs font-medium transition-colors ${
                                tweetFeedType === "both"
                                  ? "bg-[#00D992] text-black"
                                  : "bg-transparent text-gray-400 hover:text-white hover:bg-neutral-700"
                              }`}
                            >
                              Both
                            </button>
                            <button
                              onClick={() => {
                                setTweetFeedType("original");
                                setSelectedTweet(null);
                                setLlmResponse("");
                                setEditedResponse("");
                                setLlmIntentUrl("");
                                if (!isRaidTargetLocked) {
                                  updateRaidTarget("");
                                }
                                updateResponseType("supportive");
                                updateTone("enthusiastic");
                              }}
                              disabled={
                                !handleDetails &&
                                Boolean(selectedItem?.twitter_final)
                              }
                              className={`px-3 py-2 text-xs font-medium transition-colors ${
                                tweetFeedType === "original"
                                  ? "bg-[#00D992] text-black"
                                  : "bg-transparent text-gray-400 hover:text-white hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              }`}
                            >
                              Project
                            </button>
                            <button
                              onClick={() => {
                                setTweetFeedType("mentions");
                                setSelectedTweet(null);
                                setLlmResponse("");
                                setEditedResponse("");
                                setLlmIntentUrl("");
                                if (!isRaidTargetLocked) {
                                  updateRaidTarget("");
                                }
                                updateResponseType("supportive");
                                updateTone("enthusiastic");
                              }}
                              className={`px-3 py-2 text-xs font-medium transition-colors ${
                                tweetFeedType === "mentions"
                                  ? "bg-[#00D992] text-black"
                                  : "bg-transparent text-gray-400 hover:text-white hover:bg-neutral-700"
                              }`}
                            >
                              Mentions
                            </button>
                          </div>
                          <span className="text-gray-400 text-xs">
                            ({uniqueTweets.length})
                          </span>
                        </div>

                        {/* Mobile Raid Target Input */}
                        <RaidsTargetInput
                          raidTarget={raidTarget}
                          isRaidTargetLocked={isRaidTargetLocked}
                          selectedSymbol={selectedItem?.symbol}
                          onRaidTargetChange={updateRaidTarget}
                          onRaidTargetLockChange={updateIsRaidTargetLocked}
                          onRaidTargetSelect={handleRaidTargetSelect}
                          searchResults={raidTargetSearchResults}
                          isSearching={isRaidTargetSearching}
                        />
                      </div>

                      {/* Tweets List */}
                      <div className="space-y-4">
                        {loadingTweets ? (
                          Array.from({ length: 7 }).map((_, i) => (
                            <Skeleton key={i} className="h-32" />
                          ))
                        ) : uniqueTweets.length > 0 ? (
                          uniqueTweets.map((tweet) => (
                            <RaidsTweetCard
                              key={`mobile-${selectedItem?.symbol}-${tweet.tweet_id}`}
                              tweet={tweet}
                              isSelected={
                                selectedTweet?.tweet_id === tweet.tweet_id
                              }
                              tweetFeedType={tweetFeedType}
                              originalTweets={originalTweets}
                              onGenerateResponse={handleGenerateResponse}
                              onLikeIntent={handleLikeIntent}
                              onRetweetIntent={handleRetweetIntent}
                            />
                          ))
                        ) : (
                          <div className="text-center text-gray-400 py-8">
                            No tweets available
                          </div>
                        )}

                        {/* Mobile Lazy Loading Indicator */}
                        {loadingMoreTweets && (
                          <div className="text-center py-4">
                            <div className="flex items-center justify-center gap-2 text-gray-400">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00D992]"></div>
                              <span className="text-sm">
                                Loading more tweets...
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Mobile End of tweets indicator */}
                        {!loadingMoreTweets &&
                          !tweetPagination.hasMore &&
                          uniqueTweets.length > 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              No more tweets to load
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Mobile Response Panel - Sticky Bottom */}
                    {(selectedTweet || loadingTweets || selectedItem) && (
                      <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-600 p-4 z-50">
                        <RaidsResponsePanel
                          selectedTweet={selectedTweet}
                          llmResponse={llmResponse}
                          editedResponse={editedResponse}
                          llmLoading={llmLoading}
                          imageLoading={imageLoading}
                          generatedShareUrl={generatedShareUrl}
                          responseType={responseType}
                          tone={tone}
                          onResponseTypeChange={updateResponseType}
                          onToneChange={updateTone}
                          onEditedResponseChange={setEditedResponse}
                          onGenerateImage={generateRaidImage}
                          onCopyImage={(url) => {
                            const response = fetch(url);
                            response
                              .then((r) => r.blob())
                              .then((blob) => {
                                navigator.clipboard.write([
                                  new ClipboardItem({
                                    [blob.type]: blob,
                                  }),
                                ]);
                              });
                          }}
                          onPostToTwitter={handlePostToTwitter}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex gap-4 h-full">
          {/* Left Panel */}
          <RaidsLeftPanel
            isSearching={isSearching}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selectedItem={selectedItem}
            onItemSelect={setSelectedItem}
            items={isSearching ? searchResults : trendingTokens}
            loadingItems={loadingTrendingTokens}
            selectedChains={selectedChains}
            availableChains={availableChains}
            onChainsChange={setSelectedChains}
            onTokenIdCopy={handleTokenIdCopy}
          />

          {/* Right Section - Main Panel */}
          <main className="flex-1 min-w-0 flex flex-col gap-4 h-full">
            {/* Token Details */}
            <RaidsTokenDetails
              tokenDetails={tokenDetails}
              handleDetails={handleDetails}
              onTokenIdCopy={handleTokenIdCopy}
            />

            {/* Tweet Feed Header */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-4">
                <div className="flex bg-neutral-800 border border-neutral-600 rounded-none">
                  <button
                    onClick={() => {
                      setTweetFeedType("both");
                      setSelectedTweet(null);
                      setLlmResponse("");
                      setEditedResponse("");
                      setLlmIntentUrl("");
                      if (!isRaidTargetLocked) {
                        updateRaidTarget("");
                      }
                      updateResponseType("supportive");
                      updateTone("enthusiastic");
                    }}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      tweetFeedType === "both"
                        ? "bg-[#00D992] text-black"
                        : "bg-transparent text-gray-400 hover:text-white hover:bg-neutral-700"
                    }`}
                  >
                    Both
                  </button>
                  <button
                    onClick={() => {
                      setTweetFeedType("original");
                      setSelectedTweet(null);
                      setLlmResponse("");
                      setEditedResponse("");
                      setLlmIntentUrl("");
                      if (!isRaidTargetLocked) {
                        updateRaidTarget("");
                      }
                      updateResponseType("supportive");
                      updateTone("enthusiastic");
                    }}
                    disabled={
                      !handleDetails && Boolean(selectedItem?.twitter_final)
                    }
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      tweetFeedType === "original"
                        ? "bg-[#00D992] text-black"
                        : "bg-transparent text-gray-400 hover:text-white hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    Project Tweets
                  </button>
                  <button
                    onClick={() => {
                      setTweetFeedType("mentions");
                      setSelectedTweet(null);
                      setLlmResponse("");
                      setEditedResponse("");
                      setLlmIntentUrl("");
                      if (!isRaidTargetLocked) {
                        updateRaidTarget("");
                      }
                      updateResponseType("supportive");
                      updateTone("enthusiastic");
                    }}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      tweetFeedType === "mentions"
                        ? "bg-[#00D992] text-black"
                        : "bg-transparent text-gray-400 hover:text-white hover:bg-neutral-700"
                    }`}
                  >
                    Mentions
                  </button>
                </div>
                <span className="text-gray-400 text-sm">
                  ({uniqueTweets.length} tweets)
                </span>
              </div>

              {/* Raid Target Input */}
              <RaidsTargetInput
                raidTarget={raidTarget}
                isRaidTargetLocked={isRaidTargetLocked}
                selectedSymbol={selectedItem?.symbol}
                onRaidTargetChange={updateRaidTarget}
                onRaidTargetLockChange={updateIsRaidTargetLocked}
                onRaidTargetSelect={handleRaidTargetSelect}
                searchResults={raidTargetSearchResults}
                isSearching={isRaidTargetSearching}
              />
            </div>

            {/* Main Content: Tweets and LLM Response */}
            <div className="flex flex-row gap-4 flex-1 min-h-0">
              {/* Tweets List */}
              <div className="flex-1 min-w-[500px] flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 tweet-feed-container">
                  {loadingTweets ? (
                    Array.from({ length: 7 }).map((_, i) => (
                      <Skeleton key={i} className="h-32" />
                    ))
                  ) : uniqueTweets.length > 0 ? (
                    uniqueTweets.map((tweet) => (
                      <RaidsTweetCard
                        key={`${selectedItem?.symbol}-${tweet.tweet_id}`}
                        tweet={tweet}
                        isSelected={selectedTweet?.tweet_id === tweet.tweet_id}
                        tweetFeedType={tweetFeedType}
                        originalTweets={originalTweets}
                        onGenerateResponse={handleGenerateResponse}
                        onLikeIntent={handleLikeIntent}
                        onRetweetIntent={handleRetweetIntent}
                      />
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      No tweets available
                    </div>
                  )}

                  {/* Lazy Loading Indicator */}
                  {loadingMoreTweets && (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00D992]"></div>
                        <span className="text-sm">Loading more tweets...</span>
                      </div>
                    </div>
                  )}

                  {/* End of tweets indicator */}
                  {!loadingMoreTweets &&
                    !tweetPagination.hasMore &&
                    uniqueTweets.length > 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No more tweets to load
                      </div>
                    )}
                </div>
              </div>

              {/* Response Panel */}
              <div className="w-[280px] shrink-0">
                <RaidsResponsePanel
                  selectedTweet={selectedTweet}
                  llmResponse={llmResponse}
                  editedResponse={editedResponse}
                  llmLoading={llmLoading}
                  imageLoading={imageLoading}
                  generatedShareUrl={generatedShareUrl}
                  responseType={responseType}
                  tone={tone}
                  onResponseTypeChange={updateResponseType}
                  onToneChange={updateTone}
                  onEditedResponseChange={setEditedResponse}
                  onGenerateImage={generateRaidImage}
                  onCopyImage={(url) => {
                    const response = fetch(url);
                    response
                      .then((r) => r.blob())
                      .then((blob) => {
                        navigator.clipboard.write([
                          new ClipboardItem({
                            [blob.type]: blob,
                          }),
                        ]);
                      });
                  }}
                  onPostToTwitter={handlePostToTwitter}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
