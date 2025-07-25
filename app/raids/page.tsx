"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { TrendingUp, Search, ExternalLink, Hash, ChevronDown, Users, Sparkles, Filter, ArrowLeft, Copy } from "lucide-react";
import { LikeIcon, ReplyIcon, RetweetIcon, ViewIcon, ShareIcon } from "@/components/icons/twitter-icons";
import { XLogo } from "@/components/icons/x-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { formatNumber, getPriceChangeColor, copyImage } from "../components/raids/RaidsUtils";
import type {
  LeftSectionItem,
  Tweet,
  TrendingToken,
  SearchToken,
  TokenDetails,
  HandleDetails,
  TrendingTokensResponse,
  SearchResultsResponse,
  AuthorDetailsFullResponse,
  GenerateResponseRequest,
  GenerateResponseResponse,
  TweetFeedResponse
} from "../components/raids/RaidsInterfaces";
import { useToast } from "@/hooks/use-toast";

export default function RaidsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [searchResults, setSearchResults] = useState<SearchToken[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sidebarFilter, setSidebarFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState<LeftSectionItem | null>(null);
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [handleDetails, setHandleDetails] = useState<HandleDetails | null>(null);
  const [originalTweets, setOriginalTweets] = useState<Tweet[]>([]);
  const [mentions, setMentions] = useState<Tweet[]>([]);
  const [loadingTrendingTokens, setLoadingTrendingTokens] = useState(true);
  const [loadingTokenDetails, setLoadingTokenDetails] = useState(true);
  const [loadingTweets, setLoadingTweets] = useState(true);
  const [loadingAuthorDetails, setLoadingAuthorDetails] = useState(true);
  const [tweetFeedType, setTweetFeedType] = useState<"both" | "original" | "mentions">("both");
  const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);
  const [llmResponse, setLlmResponse] = useState<string>("");
  const [editedResponse, setEditedResponse] = useState<string>("");
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmIntentUrl, setLlmIntentUrl] = useState<string>("");
  const [generatedShareUrl, setGeneratedShareUrl] = useState<string>("");
  const [generatedHtmlUrl, setGeneratedHtmlUrl] = useState<string>("");
  const [imageLoading, setImageLoading] = useState(false);

  // Raid target state
  const [raidTarget, setRaidTarget] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('raidTarget') || "";
    }
    return "";
  });
  const [isRaidTargetLocked, setIsRaidTargetLocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isRaidTargetLocked') === 'true';
    }
    return false;
  });

  // Raid target search state
  const [raidTargetSearchTerm, setRaidTargetSearchTerm] = useState("");
  const [debouncedRaidTargetSearchTerm, setDebouncedRaidTargetSearchTerm] = useState("");
  const [raidTargetSearchResults, setRaidTargetSearchResults] = useState<SearchToken[]>([]);
  const [isRaidTargetSearching, setIsRaidTargetSearching] = useState(false);
  const [showRaidTargetDropdown, setShowRaidTargetDropdown] = useState(false);

  // Response customization state
  const [responseType, setResponseType] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('responseType') || "supportive";
    }
    return "supportive";
  });
  const [tone, setTone] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tone') || "enthusiastic";
    }
    return "enthusiastic";
  });

  // Chain filter state
  const [selectedChains, setSelectedChains] = useState<string[]>(['solana', 'base', 'ethereum', 'bsc']);
  const [availableChains, setAvailableChains] = useState<string[]>(['solana', 'base', 'ethereum', 'bsc']);

  // Wrapper functions to update both state and localStorage
  const updateRaidTarget = (value: string) => {
    setRaidTarget(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('raidTarget', value);
    }
  };

  const updateIsRaidTargetLocked = (value: boolean) => {
    setIsRaidTargetLocked(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isRaidTargetLocked', value.toString());
    }
  };

  const updateResponseType = (value: string) => {
    setResponseType(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('responseType', value);
    }
  };

  const updateTone = (value: string) => {
    setTone(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tone', value);
    }
  };

  // Mobile responsive state
  const [mobileView, setMobileView] = useState<'tokens' | 'detail'>('tokens');

  // Pagination state for lazy loading tweets
  const [tweetPagination, setTweetPagination] = useState({
    start: 0,
    limit: 20,
    hasMore: true,
    nextStart: 0
  });
  const [loadingMoreTweets, setLoadingMoreTweets] = useState(false);



  const [copyStatus, setCopyStatus] = useState<string>('');



  const copyTokenId = useCallback(async (tokenId: string) => {
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
  }, [toast]);



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
      console.log('Selected item changed:', selectedItem.symbol, selectedItem.twitter_final);
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
        mention_count_24hr: (selectedItem as any).mention_count_24hr ?? (selectedItem as any).mention_count ?? 0,
        total_accounts_24hr: (selectedItem as any).total_accounts_24hr ?? (selectedItem as any).total_accounts ?? 0,
        influencer_count_24hr: (selectedItem as any).influencer_count_24hr ?? (selectedItem as any).influencer_count ?? 0,
        marketcap: selectedItem.marketcap ?? 0,
        volume_24hr: 'volume_24hr' in selectedItem ? (selectedItem as any).volume_24hr ?? 0 : 0,
        pc_24_hr: 'pc_24_hr' in selectedItem ? (selectedItem as any).pc_24_hr ?? 0 : 0,
        narrative: 'narrative' in selectedItem ? (selectedItem as any).narrative ?? "" : "",
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
        nextStart: 0
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
        const chains = [...new Set(data.result?.map((token: TrendingToken) => token.chain) || [])];
        setAvailableChains(chains);

        // Initialize selected chains to default chains (BSC, Base, Solana, ETH)
        if (chains.length > 0 && selectedChains.length === 0) {
          const defaultChains = ['BSC', 'BASE', 'SOL', 'ETH'];
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
        `/api/raids/search?search_term=${encodeURIComponent(debouncedSearchTerm)}&limit=20`
      );
      if (response.ok) {
        const data: SearchResultsResponse = await response.json();
        setSearchResults(data.result || []);

        // Extract unique chains from search results and merge with existing available chains
        const searchChains = [...new Set(data.result?.map((token: SearchToken) => token.chain) || [])];
        setAvailableChains(prev => {
          const allChains = [...new Set([...prev, ...searchChains])];
          // If we have no chains selected, select default chains
          if (selectedChains.length === 0) {
            const defaultChains = ['BSC', 'BASE', 'SOL', 'ETH'];
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
        `/api/raids/search?search_term=${encodeURIComponent(debouncedRaidTargetSearchTerm)}&limit=10`
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
            if (!prevTokenDetails) return data.result.token;

            return {
              ...prevTokenDetails,
              ...data.result.token,
              // Keep existing values if API doesn't provide them
              token_id: data.result.token!.token_id || prevTokenDetails.token_id,
              symbol: data.result.token!.symbol || prevTokenDetails.symbol,
              name: data.result.token!.name || prevTokenDetails.name,
              chain: data.result.token!.chain || prevTokenDetails.chain,
              profile_image_url: data.result.token!.profile_image_url || prevTokenDetails.profile_image_url,
            };
          });
        }
      } else {
        // If API fails, keep existing token info and just log the warning
        console.warn(`Failed to fetch author details for ${handle}, keeping existing token info`);
        setHandleDetails(null);
        // Switch to both (will show mentions since original tweets won't be available)
        setTweetFeedType("both");
      }
    } catch (error) {
      // If API fails, keep existing token info and just log the error
      console.warn(`Error fetching author details for ${handle}, keeping existing token info:`, error);
      setHandleDetails(null);
      // Switch to both (will show mentions since original tweets won't be available)
      setTweetFeedType("both");
    } finally {
      setLoadingAuthorDetails(false);
    }
  };

  const fetchTweetFeed = async ({ symbol, twitter_handle, isLoadMore = false }: { symbol?: string; twitter_handle?: string; isLoadMore?: boolean }) => {
    try {
      if (isLoadMore) {
        setLoadingMoreTweets(true);
      } else {
        setLoadingTweets(true);
      }

      console.log('Fetching tweets for:', { symbol, twitter_handle, isLoadMore });
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
      console.log('Fetching from URL:', url);
      const response = await fetch(url);

      if (response.ok) {
        const data: TweetFeedResponse = await response.json();
        console.log('Tweet feed response:', {
          originalTweets: data.result.original_tweets.length,
          mentions: data.result.mentions.length,
          pagination: data.result.pagination,
          symbol,
          twitter_handle,
          isLoadMore
        });

        if (isLoadMore) {
          // Append new tweets to existing ones
          setOriginalTweets(prev => [...prev, ...data.result.original_tweets]);
          setMentions(prev => [...prev, ...data.result.mentions]);
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
          nextStart: data.result.pagination.next_start
        });
      } else {
        console.log('Failed to fetch tweets');
        if (!isLoadMore) {
          setOriginalTweets([]);
          setMentions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
      if (!isLoadMore) {
        setOriginalTweets([]);
        setMentions([]);
      }
    } finally {
      setLoadingTweets(false);
      setLoadingMoreTweets(false);
    }
  };

  const loadMoreTweets = async () => {
    if (!selectedItem || loadingMoreTweets || !tweetPagination.hasMore) return;

    const symbol = selectedItem.symbol;
    const twitter_handle = selectedItem.twitter_final || undefined;

    await fetchTweetFeed({ symbol, twitter_handle, isLoadMore: true });
  };

  const getLeftSectionItems = (): LeftSectionItem[] => {
    const items = isSearching ? searchResults : trendingTokens;
    return items;
  };

  const filteredItems = useMemo(() => {
    const items = getLeftSectionItems();

    const filtered = items.filter((item) => {
      // Apply chain filter (if no chains are selected, show all)
      if (selectedChains.length > 0 && !selectedChains.includes(item.chain)) {
        return false;
      }

      // Apply text filter
      if (sidebarFilter.trim()) {
        return item.symbol.toLowerCase().includes(sidebarFilter.toLowerCase()) ||
          item.name.toLowerCase().includes(sidebarFilter.toLowerCase());
      }

      return true;
    });

    return filtered;
  }, [isSearching, searchResults, trendingTokens, sidebarFilter, selectedChains]);

  const tweetsToShow = tweetFeedType === "original" ? originalTweets :
    tweetFeedType === "mentions" ? mentions :
      [...originalTweets, ...mentions];

  // Ensure unique tweets by tweet_id to prevent duplicates and sort by latest first
  const uniqueTweets = tweetsToShow
    .filter((tweet, index, self) =>
      index === self.findIndex(t => t.tweet_id === tweet.tweet_id)
    )
    .sort((a, b) => {
      const dateA = new Date(a.tweet_create_time + "Z").getTime();
      const dateB = new Date(b.tweet_create_time + "Z").getTime();
      return dateB - dateA; // Latest first
    });

  // Auto-select first tweet when tweets are loaded and no tweet is selected
  useEffect(() => {
    if (uniqueTweets.length > 0 && !selectedTweet && !loadingTweets) {
      setSelectedTweet(uniqueTweets[0]);
    }
  }, [uniqueTweets, selectedTweet, loadingTweets]);

  // Scroll event listener for lazy loading tweets
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMoreTweets || !tweetPagination.hasMore) return;

      const scrollElement = document.querySelector('.tweet-feed-container');
      if (!scrollElement) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // Load when 100px from bottom

      if (isNearBottom) {
        loadMoreTweets();
      }
    };

    const scrollElement = document.querySelector('.tweet-feed-container');
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [loadingMoreTweets, tweetPagination.hasMore, selectedItem]);



  // LLM Response Generation
  const handleGenerateResponse = async (tweet: Tweet) => {
    setSelectedTweet(tweet);
    setLlmLoading(true);
    setLlmResponse("");
    setEditedResponse("");
    setLlmIntentUrl("");
    try {
      const selectedSymbol = selectedItem && 'symbol' in selectedItem ? selectedItem.symbol : '';
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

      const response = await fetch(
        `/api/raids/generate-response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
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

  const handleEditResponse = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedResponse(e.target.value);
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
        if (lowerContent.includes("🚀") || lowerContent.includes("moon") || lowerContent.includes("pump")) return "enthusiastic";
        if (lowerContent.includes("💎") || lowerContent.includes("hodl") || lowerContent.includes("diamond")) return "confident";
        if (lowerContent.includes("🔥") || lowerContent.includes("fire") || lowerContent.includes("hot")) return "excited";
        if (lowerContent.includes("😱") || lowerContent.includes("wow") || lowerContent.includes("amazing")) return "surprised";
        return "enthusiastic"; // default
      };

      const responseType = determineResponseType(selectedTweet.sentiment, editedResponse);
      const tone = determineTone(editedResponse);

      // Use raid target if specified, otherwise use selected community symbol
      const raidTargetSymbol = raidTarget.trim() || selectedItem.symbol;

      // Call the AI image generation API
      const response = await fetch(`/api/raids/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `A dynamic crypto raid response image featuring ${raidTargetSymbol} token on ${selectedItem.chain} blockchain. The image should represent a ${tone} ${responseType} response to a tweet about ${raidTargetSymbol}. Show crypto trading charts, rocket emojis, and a futuristic trading interface with ${raidTargetSymbol} prominently displayed. The mood should reflect: ${editedResponse.substring(0, 100)}...`,
          style: "realistic",
          aspect_ratio: "16:9",
          token_symbol: raidTargetSymbol,
          author_handle: selectedTweet.author_handle,
          original_tweet_content: selectedTweet.body,
          ai_response_content: editedResponse,
          tweet_author_handle: selectedTweet.author_handle,
          response_type: responseType,
          tone: tone
        }),
      });

      const data = await response.json();

      if (data.result && data.result.image_url && data.result.html_url) {
        setGeneratedShareUrl(data.result.image_url); // Use image URL for preview
        setGeneratedHtmlUrl(data.result.html_url); // Use HTML URL for sharing
        console.log("AI image and HTML page generated successfully:", data.result.image_url);
      } else {
        console.error("Failed to generate image:", data.message);
        // Fallback to static image if API fails
        setGeneratedShareUrl("https://dhowgvd18tbhl.cloudfront.net/raid-images/grokbanner.jpeg");
        setGeneratedHtmlUrl("");
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
      // Fallback to static image if API fails
      setGeneratedShareUrl("https://dhowgvd18tbhl.cloudfront.net/raid-images/grokbanner.jpeg");
      setGeneratedHtmlUrl("");
    } finally {
      setImageLoading(false);
    }
  };

  // Remove auto-generation - users will click the button explicitly

  const handlePostToTwitter = async () => {

    if (!selectedTweet || !editedResponse) return;

    // First, copy the generated image to clipboard if available
    if (generatedShareUrl) {
      await copyImage(generatedShareUrl);
    }

    let tweetText = editedResponse;

    // Add share URL to the tweet text if available
    // if (generatedHtmlUrl) {
    //   tweetText += `\n\n${generatedHtmlUrl}`;
    // }

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&in_reply_to=${selectedTweet.tweet_id}`;

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

  // Chain filter handlers
  const handleSelectAllChains = () => {
    setSelectedChains(availableChains);
  };

  const handleDeselectAllChains = () => {
    setSelectedChains([]);
  };

  const handleToggleChain = (chain: string, checked: boolean) => {
    if (checked) {
      setSelectedChains(prev => [...prev, chain]);
    } else {
      setSelectedChains(prev => prev.filter(c => c !== chain));
    }
  };

  // Mobile handlers
  const handleMobileTokenSelect = (item: LeftSectionItem) => {
    setSelectedItem(item);
    setMobileView('detail');
  };

  const handleMobileBackToTokens = () => {
    setMobileView('tokens');
  };

  const handleRaidTargetSelect = (item: SearchToken) => {
    const target = item.twitter_final ? `@${item.twitter_final}` : `$${item.symbol}`;
    updateRaidTarget(target);
    setRaidTargetSearchTerm("");
    setShowRaidTargetDropdown(false);
    setRaidTargetSearchResults([]);
  };

  const handleRaidTargetInputChange = (value: string) => {
    setRaidTargetSearchTerm(value);
    updateRaidTarget(value);
    setShowRaidTargetDropdown(value.length >= 2);
  };

  const handleRaidTargetInputFocus = () => {
    if (raidTargetSearchTerm.length >= 2) {
      setShowRaidTargetDropdown(true);
    }
  };

  const handleRaidTargetInputBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      setShowRaidTargetDropdown(false);
    }, 200);
  };

  const renderLeftSectionItem = (item: LeftSectionItem, index: number) => {
    const isSelected = selectedItem === item;

    return (
      <div
        key={`token-${item.token_id || index}`}
        className={`w-full flex items-center gap-3 p-3 rounded-none transition-all text-left hover:bg-neutral-800 border-2 cursor-pointer ${isSelected
            ? "bg-[#00D992]/10 border-[#00D992] shadow-lg shadow-[#00D992]/20"
            : "border-transparent hover:border-neutral-600"
          }`}
        onClick={() => setSelectedItem(item)}
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
            <span className={`font-semibold truncate ${isSelected ? "text-[#00D992]" : "text-white"}`}>{item.symbol}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                copyTokenId(item.token_id);
              }}
              className="h-6 w-6 p-0 text-gray-400 hover:text-[#00D992] hover:bg-[#00D992]/10"
            >
              <Copy className="w-3 h-3" />
            </Button>
            {!isSearching && (
              <TrendingUp className="w-3 h-3 text-[#00D992] shrink-0" />
            )}
            {isSearching && (
              <Search className="w-3 h-3 text-blue-400 shrink-0" />
            )}
          </div>
          <span className="text-xs text-gray-400 truncate block">{item.name}</span>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1 min-w-0">
            <span className="truncate">Mentions: {formatNumber('mention_count_24hr' in item ? item.mention_count_24hr : item.mention_count)}</span>
            <Badge variant="outline" className="text-xs bg-neutral-700 border-neutral-500 text-gray-300 shrink-0 ml-2">
              {item.chain}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[url('/landingPageBg.png')] bg-cover bg-no-repeat pt-20 md:pt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 h-[calc(100vh-8rem)]">
        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col h-full">
          {mobileView === 'tokens' ? (
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
                      {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
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

                {/* Filter for current section */}
                {/* <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder={`Filter ${isSearching ? 'results' : 'tokens'}...`}
                    value={sidebarFilter}
                    onChange={(e) => setSidebarFilter(e.target.value)}
                    className="pl-10 pr-3 py-2 text-sm bg-neutral-800 border-neutral-600 text-white placeholder-gray-400 focus:border-[#00D992] focus:ring-[#00D992]"
                  />
                </div> */}

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
                                  : `${selectedChains.length} Chain${selectedChains.length !== 1 ? 's' : ''} Selected`
                              }
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 bg-neutral-800 border-neutral-600 text-white">
                        <DropdownMenuLabel className="text-gray-300">Select Chains</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-neutral-600" />

                        {/* Select All / Deselect All */}
                        <DropdownMenuCheckboxItem
                          checked={selectedChains.length === availableChains.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleSelectAllChains();
                            } else {
                              handleDeselectAllChains();
                            }
                          }}
                          className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                        >
                          {selectedChains.length === availableChains.length ? "Deselect All" : "Select All"}
                        </DropdownMenuCheckboxItem>

                        <DropdownMenuSeparator className="bg-neutral-600" />

                        {/* Individual Chain Options */}
                        {availableChains.map((chain) => (
                          <DropdownMenuCheckboxItem
                            key={chain}
                            checked={selectedChains.includes(chain)}
                            onCheckedChange={(checked) => handleToggleChain(chain, checked)}
                            className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-700"
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
                      <Skeleton key={i} className="flex items-center gap-3 p-2 rounded-none">
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
                            <span className="font-semibold truncate text-white">{item.symbol}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyTokenId(item.token_id);
                              }}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-[#00D992] hover:bg-[#00D992]/10"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>

                          </div>
                          <span className="text-xs text-gray-400 truncate block">{item.name}</span>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-1 min-w-0">
                            <span className="truncate">Mentions: {formatNumber('mention_count_24hr' in item ? item.mention_count_24hr : item.mention_count)}</span>
                            <Badge variant="outline" className="text-xs bg-neutral-700 border-neutral-500 text-gray-300 shrink-0 ml-2">
                              {item.chain}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    {isSearching ? "No search results found." :
                      "No tokens found matching the current filters."}
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
              <div className={`flex-1 overflow-y-auto tweet-feed-container ${selectedTweet ? 'pb-48' : ''}`}>
                {loadingAuthorDetails || loadingTokenDetails ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-64 mb-2" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Item Details - Compact Mobile */}
                    <div className="bg-neutral-800 border border-neutral-600 rounded-none p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={tokenDetails?.profile_image_url || handleDetails?.profile_image_url || "/placeholder.svg"}
                          alt={tokenDetails?.symbol || handleDetails?.author_handle}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-lg font-bold truncate">{tokenDetails?.symbol || handleDetails?.author_handle}</h1>
                            {tokenDetails?.token_id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyTokenId(tokenDetails.token_id)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-[#00D992] hover:bg-[#00D992]/10"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            )}
                            <Badge variant="outline" className="text-xs bg-neutral-700 border-neutral-500 shrink-0">{tokenDetails?.chain || "N/A"}</Badge>
                            {(tokenDetails?.twitter_final || handleDetails?.author_handle) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const twitterHandle = tokenDetails?.twitter_final || handleDetails?.author_handle;
                                  if (twitterHandle) {
                                    window.open(`https://x.com/search?q=${encodeURIComponent(twitterHandle)}&src=typed_query&f=live`, "_blank");
                                  }
                                }}
                                className="border-neutral-600 text-gray-300 hover:border-[#00D992] hover:text-black flex items-center gap-1 shrink-0"
                              >
                                <XLogo className="w-3 h-3" />
                                <span className="text-xs">Twitter</span>
                              </Button>
                            )}
                          </div>
                          <p className="text-gray-300 text-xs mb-2 truncate">
                            {tokenDetails?.name || handleDetails?.bio || "No description available"}
                          </p>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div>
                              <span className="text-gray-400 block">Mentions</span>
                              <p className="font-medium">{formatNumber(tokenDetails?.mention_count_24hr || 0)}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 block">MC</span>
                              <p className="font-medium">{formatNumber(tokenDetails?.marketcap || 0)}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 block">24h Δ</span>
                              <p className={`font-medium ${getPriceChangeColor((tokenDetails?.pc_24_hr ?? 0) > 0 ? 1 : -1)}`}>{(tokenDetails?.pc_24_hr ?? 0).toFixed(1)}%</p>
                            </div>
                            <div>
                              <span className="text-gray-400 block">VolN</span>
                              <p className="font-medium">{formatNumber(tokenDetails?.volume_24hr || 0)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

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
                              className={`px-3 py-2 text-xs font-medium transition-colors ${tweetFeedType === "both"
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
                              disabled={!handleDetails && Boolean(selectedItem?.twitter_final)}
                              className={`px-3 py-2 text-xs font-medium transition-colors ${tweetFeedType === "original"
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
                              className={`px-3 py-2 text-xs font-medium transition-colors ${tweetFeedType === "mentions"
                                  ? "bg-[#00D992] text-black"
                                  : "bg-transparent text-gray-400 hover:text-white hover:bg-neutral-700"
                                }`}
                            >
                              Mentions
                            </button>
                          </div>
                          <span className="text-gray-400 text-xs">({uniqueTweets.length})</span>
                        </div>

                        {/* Mobile Raid Target Input - Horizontal */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-xs">
                            {raidTarget && (
                              <div className="text-[#00D992] whitespace-nowrap">
                                Raiding: <span className="font-medium">{raidTarget}</span>
                              </div>
                            )}
                            {!raidTarget && selectedItem && (
                              <div className="text-gray-500 whitespace-nowrap">
                                Raiding: <span className="font-medium">${selectedItem.symbol}</span>
                              </div>
                            )}
                          </div>
                          <div className="relative w-40">
                            <Input
                              type="text"
                              placeholder="Search tokens or @handles..."
                              value={raidTargetSearchTerm || raidTarget}
                              onChange={(e) => handleRaidTargetInputChange(e.target.value)}
                              onFocus={handleRaidTargetInputFocus}
                              onBlur={handleRaidTargetInputBlur}
                              className="w-40 pr-8 text-xs bg-neutral-900 border-neutral-600 text-white placeholder-gray-500 focus:border-[#00D992] focus:ring-[#00D992] rounded-none h-8"
                            />
                            {raidTarget && (
                              <button
                                onClick={() => {
                                  updateRaidTarget("");
                                  setRaidTargetSearchTerm("");
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 text-xs"
                                title="Clear raid target"
                              >
                                ×
                              </button>
                            )}
                            {showRaidTargetDropdown && (raidTargetSearchResults.length > 0 || isRaidTargetSearching) && (
                              <div className="absolute top-full left-0 w-80 bg-neutral-800 border border-neutral-600 border-t-0 max-h-48 overflow-y-auto z-50">
                                {isRaidTargetSearching ? (
                                  <div className="p-2 text-xs text-gray-400 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#00D992]"></div>
                                      Searching...
                                    </div>
                                  </div>
                                ) : (
                                  raidTargetSearchResults.map((item, index) => (
                                    <div
                                      key={`raid-target-${item.token_id || index}`}
                                      className="flex items-center gap-2 p-2 hover:bg-neutral-700 cursor-pointer border-b border-neutral-600 last:border-b-0"
                                      onClick={() => handleRaidTargetSelect(item)}
                                    >
                                      <img
                                        src={item.profile_image_url || "/placeholder.svg"}
                                        alt={item.symbol}
                                        className="w-6 h-6 rounded-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.src = "/placeholder.svg";
                                        }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-medium text-white">${item.symbol}</span>
                                          {item.twitter_final && (
                                            <span className="text-xs text-blue-400">@{item.twitter_final}</span>
                                          )}
                                          <Badge variant="outline" className="text-xs bg-neutral-700 border-neutral-500 text-gray-300">
                                            {item.chain}
                                          </Badge>
                                        </div>
                                        <div className="text-xs text-gray-400 truncate">{item.name}</div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateIsRaidTargetLocked(!isRaidTargetLocked)}
                            className={`text-xs px-2 py-1 h-8 ${isRaidTargetLocked
                                ? "text-[#00D992] bg-[#00D992]/10"
                                : "text-gray-400 hover:text-[#00D992]"
                              }`}
                            title={isRaidTargetLocked ? "Unlock raid target" : "Lock raid target"}
                          >
                            {isRaidTargetLocked ? "🔒" : "🔓"}
                          </Button>
                        </div>
                      </div>

                      {/* Tweets List */}
                      {!loadingTweets ? (
                        <div className="space-y-4">
                        {loadingTweets ? (
                          Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-32" />)
                        ) : uniqueTweets.length > 0 ? (
                          uniqueTweets.map((tweet) => (
                            <Card
                              key={`mobile-${selectedItem?.symbol}-${tweet.tweet_id}`}
                              className={`bg-neutral-800 border-neutral-600 transition-all hover:bg-neutral-750 hover:border-neutral-500 cursor-pointer rounded-none ${selectedTweet?.tweet_id === tweet.tweet_id ? "border-[#00D992]" : ""}`}
                              onClick={() => handleGenerateResponse(tweet)}
                            >
                              <CardContent className="p-4 max-w-full">
                                <div className="flex items-start gap-3 mb-2">
                                  <img
                                    src={tweet.profile_image_url || "/placeholder.svg"}
                                    alt={`@${tweet.author_handle}`}
                                    className="w-10 h-10 rounded-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = "/placeholder.svg";
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-100 text-sm truncate">
                                          {tweet.author_handle}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`https://twitter.com/i/status/${tweet.tweet_id}`, "_blank");
                                          }}
                                          className="text-gray-400 hover:text-[#00D992] p-1"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                        </Button>

                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleGenerateResponse(tweet);
                                        }}
                                        className="text-[#00D992] hover:text-[#00C484] bg-[#00D992]/10 hover:bg-[#00D992]/20 px-2 py-1 rounded-none animate-pulse"
                                      >
                                        <Sparkles className="w-4 h-4 mr-1" />
                                        <span className="text-xs font-medium">Raid</span>
                                      </Button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="text-xs text-gray-400">
                                        {new Date(tweet.tweet_create_time + "Z").toLocaleString()}
                                      </div>
                                      {tweetFeedType === "both" && (
                                        <Badge variant="outline" className={`text-xs ${originalTweets.some(t => t.tweet_id === tweet.tweet_id)
                                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                            : 'bg-green-500/20 border-green-500/50 text-green-400'
                                          }`}>
                                          {originalTweets.some(t => t.tweet_id === tweet.tweet_id) ? 'Author' : 'Mention'}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-300 mb-3 break-words whitespace-pre-wrap">{tweet.body}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                          <ReplyIcon className="w-3 h-3" />
                                          <span>{tweet.reply_count}</span>
                                        </div>
                                        <div
                                          className="flex items-center gap-1 hover:text-green-400 cursor-pointer transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRetweetIntent(tweet);
                                          }}
                                        >
                                          <RetweetIcon className="w-3 h-3" />
                                          <span>{tweet.retweet_count}</span>
                                        </div>
                                        <div
                                          className="flex items-center gap-1 hover:text-pink-400 cursor-pointer transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleLikeIntent(tweet);
                                          }}
                                        >
                                          <LikeIcon className="w-3 h-3" />
                                          <span>{tweet.like_count}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <ViewIcon className="w-3 h-3" />
                                          <span>{tweet.view_count}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
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
                              <span className="text-sm">Loading more tweets...</span>
                            </div>
                          </div>
                        )}

                        {/* Mobile End of tweets indicator */}
                        {!loadingMoreTweets && !tweetPagination.hasMore && uniqueTweets.length > 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No more tweets to load
                          </div>
                        )}
                      </div>) : (
                        <div className="space-y-4">
                          <Skeleton className="h-32" />
                          <Skeleton className="h-32" />
                        </div>
                      )}
                    </div>

                    {/* Mobile AI Response Panel - Sticky Bottom */}
                    {(selectedTweet || loadingTweets || selectedItem) && (
                      <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-600 p-4 z-50">
                        <Card className="bg-neutral-800 border-[#00D992] rounded-none">
                          <CardContent className="p-4">
                            <div className="mb-2">
                              <div className="text-xs text-gray-400 mb-1">
                                AI Response:
                              </div>
                            </div>



                            {/* Mobile Response Type and Tone Selection */}
                            <div className="mb-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Select value={responseType} onValueChange={updateResponseType}>
                                    <SelectTrigger className="h-8 text-xs bg-neutral-900 border-neutral-600 text-white focus:border-[#00D992] focus:ring-[#00D992] rounded-none">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-800 border-neutral-600 text-white">
                                      <SelectItem value="supportive" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Supportive</SelectItem>
                                      <SelectItem value="questioning" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Questioning</SelectItem>
                                      <SelectItem value="humorous" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Humorous</SelectItem>
                                      <SelectItem value="analytical" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Analytical</SelectItem>
                                      <SelectItem value="bullish" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Bullish</SelectItem>
                                      <SelectItem value="memeish" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Memeish</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Select value={tone} onValueChange={updateTone}>
                                    <SelectTrigger className="h-8 text-xs bg-neutral-900 border-neutral-600 text-white focus:border-[#00D992] focus:ring-[#00D992] rounded-none">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-800 border-neutral-600 text-white">
                                      <SelectItem value="casual" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Casual</SelectItem>
                                      <SelectItem value="professional" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Professional</SelectItem>
                                      <SelectItem value="enthusiastic" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Enthusiastic</SelectItem>
                                      <SelectItem value="moonish" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Moonish</SelectItem>
                                      <SelectItem value="diamond" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Diamond Hands</SelectItem>
                                      <SelectItem value="fomo" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">FOMO</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                            <div className="mb-2">
                              {llmLoading ? (
                                <div className="w-full h-24 bg-neutral-900 border border-neutral-600 rounded-none p-2">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#00D992]"></div>
                                      <span className="text-xs text-gray-400">Generating...</span>
                                    </div>
                                    <div className="space-y-1">
                                      <Skeleton className="h-3 w-full" />
                                      <Skeleton className="h-3 w-3/4" />
                                      <Skeleton className="h-3 w-5/6" />
                                      <Skeleton className="h-3 w-2/3" />
                                    </div>
                                  </div>
                                </div>
                              ) : !selectedTweet ? (
                                <div className="w-full h-24 bg-neutral-900 border border-neutral-600 rounded-none p-2">
                                  <div className="space-y-1">
                                    {loadingTweets ? (
                                      <>
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-[#00D992]"></div>
                                          <span className="text-xs text-gray-400">Loading tweets...</span>
                                        </div>
                                        <Skeleton className="h-3 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-3 w-5/6" />
                                      </>
                                    ) : (
                                      <>
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-3/4" />
                                        <Skeleton className="h-3 w-5/6" />
                                        <Skeleton className="h-3 w-2/3" />
                                        <Skeleton className="h-3 w-4/5" />
                                      </>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <textarea
                                  className="w-full h-24 bg-neutral-900 border border-neutral-600 rounded-none p-2 text-white text-sm focus:border-[#00D992] focus:ring-[#00D992] resize-none"
                                  value={editedResponse}
                                  onChange={handleEditResponse}
                                  placeholder="AI-generated response will appear here..."
                                  disabled={llmLoading}
                                />
                              )}
                            </div>

                            {/* Mobile Image Preview */}
                            {editedResponse && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-xs text-gray-400">
                                    Generated Image:
                                  </div>
                                  <div className="flex gap-2">
                                    {!generatedShareUrl && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={generateRaidImage}
                                        disabled={imageLoading || !editedResponse}
                                        className="text-[#00D992] border-[#00D992] hover:bg-[#00D992]/10 px-3 py-1"
                                      >
                                        {imageLoading ? (
                                          <div className="flex items-center gap-1">
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#00D992]"></div>
                                            <span className="text-xs">Generating...</span>
                                          </div>
                                        ) : (
                                          <span className="text-xs">🎨 Generate</span>
                                        )}
                                      </Button>
                                    )}
                                    {generatedShareUrl && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={generateRaidImage}
                                          disabled={imageLoading || !editedResponse}
                                          className="text-[#00D992] hover:text-[#00C484] hover:bg-[#00D992]/10 px-2 py-1"
                                        >
                                          {imageLoading ? (
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#00D992]"></div>
                                          ) : (
                                            <span className="text-xs">🔄</span>
                                          )}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => copyImage(generatedShareUrl)}
                                          disabled={copyStatus.includes('⏳')}
                                          className="text-blue-400 border-blue-400 hover:bg-blue-400/10 px-2 py-1"
                                        >
                                          <Copy className="w-2 h-2" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {generatedShareUrl ? (
                                  <div className="relative">
                                    <img
                                      src={generatedShareUrl}
                                      alt="Raid Response Preview"
                                      className="w-full h-auto rounded-none border border-neutral-600"
                                      style={{ maxHeight: "120px", objectFit: "cover" }}
                                    />
                                    <div className="absolute top-1 right-1 flex gap-1">
                                      <Badge variant="outline" className="text-xs bg-[#00D992]/20 border-[#00D992] text-[#00D992]">
                                        🚀
                                      </Badge>
                                    </div>
                                  </div>
                                ) : imageLoading ? (
                                  <div className="w-full h-20 bg-neutral-900 border border-neutral-600 rounded-none flex items-center justify-center">
                                    <div className="flex items-center gap-2 text-gray-400">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#00D992]"></div>
                                      <span className="text-xs">Generating...</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-full h-20 bg-neutral-900 border border-neutral-600 rounded-none flex items-center justify-center text-gray-500 text-xs">
                                    Click "Generate" to create image
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                onClick={handlePostToTwitter}
                                className="bg-blue-500 hover:bg-blue-600 text-white flex-1 rounded-none"
                                disabled={!editedResponse || llmLoading}
                              >
                                Post to Twitter
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
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
          {/* Left Section */}
          <aside className="w-80 shrink-0 border-r border-neutral-700 pr-4 flex flex-col h-full">
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
                    {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
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

              {/* Filter for current section */}
              {/* <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder={`Filter ${isSearching ? 'results' : 'tokens'}...`}
                  value={sidebarFilter}
                  onChange={(e) => setSidebarFilter(e.target.value)}
                  className="pl-10 pr-3 py-2 text-sm bg-neutral-800 border-neutral-600 text-white placeholder-gray-400 focus:border-[#00D992] focus:ring-[#00D992]"
                />
              </div> */}

              {/* Chain Filter */}
              {availableChains.length > 0 && (
                <div className="mb-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-neutral-800 border-neutral-600 text-white hover:border-[#00D992] hover:text-black rounded-none"
                      >
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4" />
                          <span className="text-sm">
                            {selectedChains.length === availableChains.length
                              ? "All Chains"
                              : selectedChains.length === 0
                                ? "All Chains"
                                : `${selectedChains.length} Chain${selectedChains.length !== 1 ? 's' : ''} Selected`
                            }
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 bg-neutral-800 border-neutral-600 text-white">

                      {/* Select All / Deselect All */}
                      <DropdownMenuCheckboxItem
                        checked={selectedChains.length === availableChains.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleSelectAllChains();
                          } else {
                            handleDeselectAllChains();
                          }
                        }}
                        className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                      >
                        {selectedChains.length === availableChains.length ? "Deselect All" : "Select All"}
                      </DropdownMenuCheckboxItem>

                      <DropdownMenuSeparator className="bg-neutral-600" />

                      {/* Individual Chain Options */}
                      {availableChains.map((chain) => (
                        <DropdownMenuCheckboxItem
                          key={chain}
                          checked={selectedChains.includes(chain)}
                          onCheckedChange={(checked) => handleToggleChain(chain, checked)}
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

            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
              {loadingTrendingTokens ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="flex items-center gap-3 p-2 rounded-none">
                      <Skeleton className="w-10 h-16 rounded-full" />
                    </Skeleton>
                  ))}
                </div>
              ) : filteredItems.length > 0 ? (
                <ul className="space-y-1">
                  {filteredItems.map((item, index) => renderLeftSectionItem(item, index))}
                </ul>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  {isSearching ? "No search results found." :
                    "No tokens found matching the current filters."}
                </div>
              )}
            </div>
          </aside>

          {/* Right Section - Main Panel */}
          <main className="flex-1 min-w-0 flex flex-col gap-4 h-full">
            {/* Item Details */}
            {loadingAuthorDetails || loadingTokenDetails ? (
              <div className="mb-6">
                <Skeleton className="h-32 w-600 mb-2" />
              </div>
            ) : (tokenDetails || handleDetails) ? (
              <div className="bg-neutral-800 border border-neutral-600 rounded-none p-4 mb-2">
                <div className="flex items-start gap-3">
                  <img
                    src={tokenDetails?.profile_image_url || handleDetails?.profile_image_url || "/placeholder.svg"}
                    alt={tokenDetails?.symbol || handleDetails?.author_handle}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold">${tokenDetails?.symbol || handleDetails?.author_handle}</h1>
                        {tokenDetails?.token_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyTokenId(tokenDetails.token_id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-[#00D992] hover:bg-[#00D992]/10"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                        <span className="text-gray-300 text-sm">{tokenDetails?.name}</span>
                        {(tokenDetails?.twitter_final || handleDetails?.author_handle) && (
                          <button
                            onClick={() => {
                              const twitterHandle = tokenDetails?.twitter_final || handleDetails?.author_handle;
                              if (twitterHandle) {
                                window.open(`https://x.com/search?q=${encodeURIComponent(twitterHandle)}&src=typed_query&f=live`, "_blank");
                              }
                            }}
                            className="text-gray-400 text-sm hover:text-[#00D992] transition-colors"
                          >
                            (@{tokenDetails?.twitter_final || handleDetails?.author_handle})
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-neutral-700 border-neutral-500">{tokenDetails?.chain || "N/A"}</Badge>
                        {/* Twitter Profile Link */}
                        {(tokenDetails?.twitter_final || handleDetails?.author_handle) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const twitterHandle = tokenDetails?.twitter_final || handleDetails?.author_handle;
                              if (twitterHandle) {
                                window.open(`https://x.com/search?q=${encodeURIComponent(twitterHandle)}&src=typed_query&f=live`, "_blank");
                              }
                            }}
                            className="border-neutral-600 text-gray-300 hover:border-[#00D992] hover:text-[#000000] p-1 h-7 px-3"
                          >
                            <XLogo className="w-3 h-3" />
                            <span className="text-xs">Twitter</span>
                          </Button>
                        )}
                      </div>
                    </div>


                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Mentions (24h)</span>
                          <p className="font-medium">{formatNumber(tokenDetails?.mention_count_24hr || 0)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Market Cap</span>
                          <p className="font-medium">{formatNumber(tokenDetails?.marketcap || 0)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">24h Change</span>
                          <p className={`font-medium ${getPriceChangeColor((tokenDetails?.pc_24_hr ?? 0) > 0 ? 1 : -1)}`}>{(tokenDetails?.pc_24_hr ?? 0).toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Volume (24h)</span>
                          <p className="font-medium">{formatNumber(tokenDetails?.volume_24hr || 0)}</p>
                        </div>
                      </div>
                      {tokenDetails?.narrative && (
                        <div className="flex flex-col gap-1">
                          {tokenDetails.narrative.split(", ").map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs bg-neutral-700 border-neutral-500 text-gray-300">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Tweet Feed Tabs */}
            {!loadingTweets ? (
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
                      className={`px-4 py-2 text-sm font-medium transition-colors ${tweetFeedType === "both"
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
                      disabled={!handleDetails && Boolean(selectedItem?.twitter_final)}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${tweetFeedType === "original"
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
                      className={`px-4 py-2 text-sm font-medium transition-colors ${tweetFeedType === "mentions"
                          ? "bg-[#00D992] text-black"
                          : "bg-transparent text-gray-400 hover:text-white hover:bg-neutral-700"
                        }`}
                    >
                      Mentions
                    </button>
                  </div>
                  <span className="text-gray-400 text-sm">({uniqueTweets.length} tweets)</span>
                </div>

                {/* Desktop Raid Target Input - Horizontal */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    {raidTarget && (
                      <div className="text-[#00D992] whitespace-nowrap">
                        Raiding: <span className="font-medium">{raidTarget}</span>
                      </div>
                    )}
                    {!raidTarget && selectedItem && (
                      <div className="text-gray-500 whitespace-nowrap">
                        Raiding: <span className="font-medium">${selectedItem.symbol}</span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search tokens or @handles..."
                      value={raidTargetSearchTerm || raidTarget}
                      onChange={(e) => handleRaidTargetInputChange(e.target.value)}
                      onFocus={handleRaidTargetInputFocus}
                      onBlur={handleRaidTargetInputBlur}
                      className="w-64 pr-10 text-sm bg-neutral-900 border-neutral-600 text-white placeholder-gray-500 focus:border-[#00D992] focus:ring-[#00D992] rounded-none h-9"
                    />
                    {raidTarget && (
                      <button
                        onClick={() => {
                          updateRaidTarget("");
                          setRaidTargetSearchTerm("");
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400"
                        title="Clear raid target"
                      >
                        ×
                      </button>
                    )}
                    {showRaidTargetDropdown && (raidTargetSearchResults.length > 0 || isRaidTargetSearching) && (
                      <div className="absolute top-full left-0 bg-neutral-800 border border-neutral-600 border-t-0 max-h-64 overflow-y-auto z-50">
                        {isRaidTargetSearching ? (
                          <div className="p-3 text-sm text-gray-400 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00D992]">
                              </div>
                              Searching...
                            </div>
                          </div>
                        ) : (
                          raidTargetSearchResults.map((item, index) => (
                            <div
                              key={`raid-target-desktop-${item.token_id || index}`}
                              className="flex items-center gap-3 p-3 hover:bg-neutral-700 cursor-pointer border-b border-neutral-600 last:border-b-0"
                              onClick={() => handleRaidTargetSelect(item)}
                            >
                              <img
                                src={item.profile_image_url || "/placeholder.svg"}
                                alt={item.symbol}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg";
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-white">${item.symbol}</span>
                                  {item.twitter_final && (
                                    <span className="text-sm text-blue-400">@{item.twitter_final}</span>
                                  )}
                                  <Badge variant="outline" className="text-xs bg-neutral-700 border-neutral-500 text-gray-300">
                                    {item.chain}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-400 truncate">{item.name}</div>
                                <div className="text-xs text-gray-500">
                                  Mentions: {formatNumber('mention_count_24hr' in item ? item.mention_count_24hr : item.mention_count)}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateIsRaidTargetLocked(!isRaidTargetLocked)}
                    className={`px-3 py-2 h-9 ${isRaidTargetLocked
                        ? "text-[#00D992] bg-[#00D992]/10"
                        : "text-gray-400 hover:text-[#00D992]"
                      }`}
                    title={isRaidTargetLocked ? "Unlock raid target" : "Lock raid target"}
                  >
                    {isRaidTargetLocked ? "🔒" : "🔓"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 mb-2">
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-8 w-32 mb-2" />
              </div>
            )}

            {/* Main Content: Tweets and LLM Response */}
            <div className="flex flex-row gap-4 flex-1 min-h-0">
              {/* Tweets List */}
              <div className="flex-1 min-w-[300px] flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 tweet-feed-container">
                  {loadingTweets ? (
                    Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-32" />)
                  ) : uniqueTweets.length > 0 ? (
                    uniqueTweets.map((tweet) => (
                      <Card
                        key={`${selectedItem?.symbol}-${tweet.tweet_id}`}
                        className={`bg-neutral-800 border-neutral-600 transition-all hover:bg-neutral-750 hover:border-neutral-500 cursor-pointer rounded-none ${selectedTweet?.tweet_id === tweet.tweet_id ? "border-[#00D992]" : ""}`}
                        onClick={() => handleGenerateResponse(tweet)}
                      >
                        <CardContent className="p-4 max-w-full">
                          <div className="flex items-start gap-3 mb-2">
                            <img
                              src={tweet.profile_image_url || "/placeholder.svg"}
                              alt={`@${tweet.author_handle}`}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-100 text-sm truncate">
                                    {tweet.author_handle}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(`https://twitter.com/i/status/${tweet.tweet_id}`, "_blank");
                                    }}
                                    className="text-gray-400 hover:text-[#00D992] p-1"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>

                                </div>
                                {selectedTweet?.tweet_id === tweet.tweet_id ? (
                                  <div className="flex items-center gap-2 text-[#00D992]">
                                    {llmLoading ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00D992]"></div>
                                        <span className="text-xs">Generating...</span>
                                      </>
                                    ) : (
                                      <div className="relative">
                                                                                                                  {/* Premium border-following line */}
                                    <div className="absolute inset-0 overflow-hidden">
                                      <div className="absolute bg-[#00F5A8] shadow-lg shadow-[#00F5A8]/60 animate-border-line"></div>
                                    </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleGenerateResponse(tweet);
                                          }}
                                          className="text-white hover:text-[#00C484] bg-transparent hover:bg-[#00D992]/10 px-3 py-2 flex items-center gap-2 animate-pulse relative z-10 border border-transparent"
                                          title="Generate AI Response"
                                        >
                                          <Sparkles className="w-4 h-4" />
                                          <span className="text-xs">Raid the tweet</span>
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="relative">
                                    {/* Premium border-following line */}
                                    <div className="absolute inset-0 overflow-hidden">
                                      <div className="absolute bg-[#00F5A8] shadow-lg shadow-[#00F5A8]/60 animate-border-line"></div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleGenerateResponse(tweet);
                                      }}
                                      className="text-white hover:text-[#00C484] bg-transparent hover:bg-[#00D992]/10 px-3 py-2 flex items-center gap-2 animate-pulse relative z-10 border border-transparent"
                                      title="Generate AI Response"
                                    >
                                      <Sparkles className="w-5 h-5" />
                                      <span className="text-xs font-medium">Raid the tweet</span>
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-400">
                                  {new Date(tweet.tweet_create_time + "Z").toLocaleString()}
                                </div>
                                {tweetFeedType === "both" && (
                                  <Badge variant="outline" className={`text-xs ${originalTweets.some(t => t.tweet_id === tweet.tweet_id)
                                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                      : 'bg-green-500/20 border-green-500/50 text-green-400'
                                    }`}>
                                    {originalTweets.some(t => t.tweet_id === tweet.tweet_id) ? 'Author' : 'Mention'}
                                  </Badge>
                                )}
                                {tweet.sentiment !== 0 && (
                                  <div className={`text-xs px-2 py-1 rounded-full ${tweet.sentiment > 0
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {tweet.sentiment > 0 ? '😊' : '😞'} {Math.abs(tweet.sentiment).toFixed(1)}
                                  </div>
                                )}
                                {tweet.tweet_category && (
                                  <Badge variant="outline" className="text-xs bg-neutral-700 border-neutral-500 text-gray-300">
                                    {tweet.tweet_category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {tweet.mentioned_author_handle && (
                            <div className="mb-2 text-xs text-gray-500">
                              Replying to <span className="text-blue-400">@{tweet.mentioned_author_handle}</span>
                            </div>
                          )}
                          <div className="mb-2">
                            <p className="text-gray-300 text-sm leading-relaxed break-words whitespace-pre-wrap overflow-hidden">
                              {tweet.body}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 hover:text-blue-400 cursor-pointer transition-colors">
                                <ReplyIcon className="w-4 h-4" />
                                <span>{formatNumber(tweet.reply_count)}</span>
                              </div>
                              <div
                                className="flex items-center gap-1 hover:text-green-400 cursor-pointer transition-colors"
                                onClick={() => handleRetweetIntent(tweet)}
                              >
                                <RetweetIcon className="w-4 h-4" />
                                <span>{formatNumber(tweet.retweet_count)}</span>
                              </div>
                              <div
                                className="flex items-center gap-1 hover:text-pink-400 cursor-pointer transition-colors"
                                onClick={() => handleLikeIntent(tweet)}
                              >
                                <LikeIcon className="w-4 h-4" />
                                <span>{formatNumber(tweet.like_count)}</span>
                              </div>
                              <div className="flex items-center gap-1 hover:text-blue-400 cursor-pointer transition-colors">
                                <ViewIcon className="w-4 h-4" />
                                <span>{formatNumber(tweet.view_count)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* <button className="hover:text-blue-400 transition-colors">
                              <ShareIcon className="w-4 h-4" />
                            </button> */}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : loadingTweets ? (
                    <div className="text-center py-8 text-gray-400">Loading tweets...</div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">No tweets found</div>
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
                  {!loadingMoreTweets && !tweetPagination.hasMore && uniqueTweets.length > 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No more tweets to load
                    </div>
                  )}
                </div>
              </div>

              {/* LLM Response and Edit Box */}
              <div className="shrink-0 min-w-[280px] max-w-[350px] flex flex-col h-full">
                {(uniqueTweets.length > 0 || selectedTweet || loadingTweets || selectedItem) && (
                  <Card className={`bg-neutral-800 ${selectedTweet ? 'border-[#00D992]' : 'border-neutral-600'} flex flex-col h-full rounded-none`}>
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="mb-0">
                        <div className="text-xs text-gray-400 mb-1">
                          AI Response:
                        </div>
                      </div>



                      {/* Response Type and Tone Selection */}
                      {selectedTweet && (
                        <div className="mb-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Select value={responseType} onValueChange={updateResponseType}>
                                <SelectTrigger className="h-8 text-xs bg-neutral-900 border-neutral-600 text-white focus:border-[#00D992] focus:ring-[#00D992] rounded-none">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-800 border-neutral-600 text-white">
                                  <SelectItem value="supportive" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Supportive</SelectItem>
                                  <SelectItem value="questioning" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Questioning</SelectItem>
                                  <SelectItem value="humorous" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Humorous</SelectItem>
                                  <SelectItem value="analytical" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Analytical</SelectItem>
                                  <SelectItem value="bullish" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Bullish</SelectItem>
                                  <SelectItem value="memeish" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Memeish</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Select value={tone} onValueChange={updateTone}>
                                <SelectTrigger className="h-8 text-xs bg-neutral-900 border-neutral-600 text-white focus:border-[#00D992] focus:ring-[#00D992] rounded-none">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-800 border-neutral-600 text-white">
                                  <SelectItem value="casual" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Casual</SelectItem>
                                  <SelectItem value="professional" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Professional</SelectItem>
                                  <SelectItem value="enthusiastic" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Enthusiastic</SelectItem>
                                  <SelectItem value="moonish" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Moonish</SelectItem>
                                  <SelectItem value="diamond" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">Diamond Hands</SelectItem>
                                  <SelectItem value="fomo" className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100">FOMO</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="mb-0 flex-1 min-h-0">
                        {llmLoading ? (
                          <div className="w-full h-full min-h-[150px] bg-neutral-900 border border-neutral-600 rounded-none p-2">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00D992]"></div>
                                <span className="text-sm text-gray-400">Generating AI response...</span>
                              </div>
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-4/5" />
                              </div>
                            </div>
                          </div>
                        ) : !selectedTweet ? (
                          <div className="w-full h-full min-h-[150px] bg-neutral-900 border border-neutral-600 rounded-none p-2">
                            <div className="space-y-2">
                              {loadingTweets ? (
                                <>
                                  <Skeleton className="h-4 w-3/4" />
                                  <Skeleton className="h-4 w-1/2" />
                                  <Skeleton className="h-4 w-5/6" />
                                  <Skeleton className="h-4 w-2/3" />
                                </>
                              ) : (
                                <>
                                  <Skeleton className="h-4 w-3/4" />
                                  <Skeleton className="h-4 w-1/2" />
                                  <Skeleton className="h-4 w-5/6" />
                                  <Skeleton className="h-4 w-2/3" />
                                  <Skeleton className="h-4 w-4/5" />
                                  <Skeleton className="h-4 w-1/3" />
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <textarea
                            className="w-full h-full min-h-[150px] bg-neutral-900 border border-neutral-600 rounded-none p-2 text-white text-sm focus:border-[#00D992] focus:ring-[#00D992] resize-none"
                            value={editedResponse}
                            onChange={handleEditResponse}
                            placeholder="AI-generated response will appear here..."
                            disabled={llmLoading}
                          />
                        )}
                      </div>

                      {/* Image Preview and Generation */}
                      {selectedTweet && editedResponse && (
                        <div className="mb-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs text-gray-400 font-medium">
                              Image:
                            </div>
                            <div className="flex gap-2">
                              {!generatedShareUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={generateRaidImage}
                                  disabled={imageLoading || !editedResponse}
                                  className="text-[#00D992] border-[#00D992] hover:bg-[#00D992]/10 px-3 py-1 text-xs"
                                >
                                  {imageLoading ? (
                                    <div className="flex items-center gap-1">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#00D992]"></div>
                                      <span className="text-xs">Generating...</span>
                                    </div>
                                  ) : (
                                    <span className="text-xs">🎨 Generate</span>
                                  )}
                                </Button>
                              )}
                              {generatedShareUrl && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={generateRaidImage}
                                    disabled={imageLoading || !editedResponse}
                                    className="text-[#00D992] hover:text-[#00C484] hover:bg-[#00D992]/10 px-2 py-1 text-xs"
                                  >
                                    {imageLoading ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#00D992]"></div>
                                    ) : (
                                      <span className="text-xs"> Regenerate </span>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyImage(generatedShareUrl)}
                                    disabled={copyStatus.includes('⏳')}
                                    className="text-blue-400 border-blue-400 hover:bg-blue-400/10 px-1 py-0 text-xs h-6 self-center"
                                  >
                                    <Copy className="w-2 h-2" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          {generatedShareUrl ? (
                            <div className="relative w-full">
                              <img
                                src={generatedShareUrl}
                                alt="Raid Response Preview"
                                className="w-full h-auto rounded-none border border-neutral-600"
                                style={{ maxHeight: "140px", objectFit: "cover" }}
                              />
                              
                            </div>
                          ) : imageLoading ? (
                            <div className="w-full h-24 bg-neutral-900 border border-neutral-600 rounded-none flex items-center justify-center">
                              <div className="flex items-center gap-2 text-gray-400">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00D992]"></div>
                                <span className="text-sm">Generating image...</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-24 bg-neutral-900 border border-neutral-600 rounded-none flex items-center justify-center text-gray-500 text-sm">
                              Click "Generate Image" to create
                            </div>
                          )}
                        </div>
                      )}

                      {selectedTweet && (
                        <div className="flex gap-2 mt-auto pt-2 border-t border-neutral-700">
                          <Button
                            onClick={handlePostToTwitter}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-0 flex-1 rounded-none"
                            disabled={!editedResponse || llmLoading}
                          >
                            Post to Twitter
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 