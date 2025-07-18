"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { TrendingUp, Search, ExternalLink, Hash, ChevronDown, Users, Sparkles } from "lucide-react";
import { LikeIcon, ReplyIcon, RetweetIcon, ViewIcon, ShareIcon } from "@/components/icons/twitter-icons";
import { XLogo } from "@/components/icons/x-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Updated interfaces to match new API structure
interface TrendingToken {
  token_id: string;
  symbol: string;
  name: string;
  chain: string;
  twitter_final: string;
  profile_image_url: string;
  mention_count: number;
  total_accounts: number;
  influencer_count: number;
  marketcap: number;
  volume_24hr: number;
  pc_24_hr: number;
  narrative: string;
}

interface TrendingTokensResponse {
  result: TrendingToken[];
  message: string;
}

interface SearchToken {
  token_id: string;
  symbol: string;
  name: string;
  chain: string;
  twitter_final: string;
  profile_image_url: string;
  mention_count_24hr: number;
  marketcap: number;
}

interface SearchResultsResponse {
  result: SearchToken[];
  message: string;
}

interface Tweet {
  tweet_id: string;
  author_handle: string;
  body: string;
  tweet_create_time: string;
  view_count: number;
  like_count: number;
  reply_count: number;
  retweet_count: number;
  profile_image_url: string;
  sentiment: number;
  tweet_category: string;
  mentioned_author_handle?: string;
}

interface TweetFeedResponse {
  result: {
    original_tweets: Tweet[];
    mentions: Tweet[];
    pagination: {
      start: number;
      limit: number;
      has_more: boolean;
      next_start: number;
    };
  };
  message: string;
}

interface TokenDetails {
  token_id: string;
  symbol: string;
  name: string;
  chain: string;
  twitter_final: string;
  profile_image_url: string;
  twitter_bio: string;
  website_final: string;
  telegram_final: string;
  mention_count_24hr: number;
  total_accounts_24hr: number;
  influencer_count_24hr: number;
  marketcap: number;
  volume_24hr: number;
  pc_24_hr: number;
  narrative: string;
}

interface HandleDetails {
  author_handle: string;
  profile_image_url: string;
  followers_count: number;
  bio: string;
}

interface AuthorDetailsFullResponse {
  result: {
    handle: HandleDetails;
    token: TokenDetails | null;
  };
  message: string;
}

interface GenerateResponseRequest {
  tweet_content: string;
  tweet_context: {
    author_handle: string;
    symbol: string;
    sentiment: number;
    tweet_category: string;
  };
  response_type: string;
  tone: string;
}

interface GenerateResponseResponse {
  result: {
    response_text: string;
    twitter_intent_url: string;
    response_type: string;
    confidence_score: number;
  };
  message: string;
}

type LeftSectionItem = TrendingToken | SearchToken;

export default function RaidsPage() {
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
  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [loadingMain, setLoadingMain] = useState(true);
  const [tweetFeedType, setTweetFeedType] = useState<"both" | "original" | "mentions">("both");
  const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);
  const [llmResponse, setLlmResponse] = useState<string>("");
  const [editedResponse, setEditedResponse] = useState<string>("");
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmIntentUrl, setLlmIntentUrl] = useState<string>("");

  // Pinned community - GrokSolanaCTO/GROK
  const pinnedCommunity: TrendingToken = {
    token_id: "pinned-grok",
    symbol: "GROK",
    name: "Grok",
    chain: "SOL",
    twitter_final: "GrokSolanaCTO",
    profile_image_url: "/placeholder.svg", // Will be updated with real data
    mention_count: 0,
    total_accounts: 0,
    influencer_count: 0,
    marketcap: 0,
    volume_24hr: 0,
    pc_24_hr: 0,
    narrative: "Pinned Community"
  };

  // State for pinned community real data
  const [pinnedCommunityData, setPinnedCommunityData] = useState<TrendingToken>(pinnedCommunity);

  // Fetch pinned community data on mount
  useEffect(() => {
    fetchPinnedCommunityData();
  }, []);

  // When pinned community data is loaded, select it by default if no item is selected
  useEffect(() => {
    if (pinnedCommunityData && !selectedItem && !isSearching && trendingTokens.length > 0) {
      setSelectedItem(pinnedCommunityData);
    }
  }, [pinnedCommunityData, selectedItem, isSearching, trendingTokens.length]);

  const fetchPinnedCommunityData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CREDBUZZ_API_URL}/raids/author-details/GrokSolanaCTO`
      );
      if (response.ok) {
        const data: AuthorDetailsFullResponse = await response.json();
        if (data.result.token) {
          // Update pinned community with real data
          const realData: TrendingToken = {
            token_id: data.result.token.token_id || "pinned-grok",
            symbol: data.result.token.symbol,
            name: data.result.token.name,
            chain: data.result.token.chain,
            twitter_final: data.result.token.twitter_final,
            profile_image_url: data.result.token.profile_image_url || "/placeholder.svg",
            mention_count: data.result.token.mention_count_24hr,
            total_accounts: data.result.token.total_accounts_24hr,
            influencer_count: data.result.token.influencer_count_24hr,
            marketcap: data.result.token.marketcap,
            volume_24hr: data.result.token.volume_24hr,
            pc_24_hr: data.result.token.pc_24_hr,
            narrative: data.result.token.narrative
          };
          setPinnedCommunityData(realData);
        }
      }
    } catch (error) {
      console.error("Failed to fetch pinned community data:", error);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch trending tokens on mount
  useEffect(() => {
    fetchTrendingTokens();
  }, []);

  // When trending tokens are loaded, select the pinned community by default
  useEffect(() => {
    if (trendingTokens.length > 0 && !selectedItem && !isSearching) {
      // Select the pinned community (GROK) by default
      setSelectedItem(pinnedCommunityData);
    }
  }, [trendingTokens, isSearching, pinnedCommunityData]);

  // When selectedItem changes, fetch its details and tweets
  useEffect(() => {
    if (selectedItem) {
      console.log('Selected item changed:', selectedItem.symbol, selectedItem.twitter_final);
      // Clear tweets immediately when switching items
      setOriginalTweets([]);
      setMentions([]);
      setLoadingMain(true);
      
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
    } else {
      // Clear everything when no item is selected
      setOriginalTweets([]);
      setMentions([]);
      setTokenDetails(null);
      setHandleDetails(null);
      setLoadingMain(false);
      setSelectedTweet(null);
      setLlmResponse("");
      setEditedResponse("");
      setLlmIntentUrl("");
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

  const fetchTrendingTokens = async () => {
    try {
      setLoadingSidebar(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CREDBUZZ_API_URL}/raids/trending-tokens?limit=30&timeframe=1hr`
      );
      if (response.ok) {
        const data: TrendingTokensResponse = await response.json();
        setTrendingTokens(data.result || []);
      } else {
        setTrendingTokens([]);
      }
    } catch (error) {
      setTrendingTokens([]);
    } finally {
      setLoadingSidebar(false);
    }
  };

  const fetchSearchResults = async () => {
    try {
      setLoadingSidebar(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CREDBUZZ_API_URL}/raids/search?search_term=${encodeURIComponent(debouncedSearchTerm)}&limit=20`
      );
      if (response.ok) {
        const data: SearchResultsResponse = await response.json();
        setSearchResults(data.result || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setLoadingSidebar(false);
    }
  };

  const fetchAuthorDetails = async (handle: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CREDBUZZ_API_URL}/raids/author-details/${encodeURIComponent(handle)}`
      );
      if (response.ok) {
        const data: AuthorDetailsFullResponse = await response.json();
        setHandleDetails(data.result.handle);
        
        // If we get token data from the API, merge it with existing token details
        if (data.result.token) {
          setTokenDetails(prevTokenDetails => {
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
    }
  };

  const fetchTweetFeed = async ({ symbol, twitter_handle }: { symbol?: string; twitter_handle?: string }) => {
    try {
      console.log('Fetching tweets for:', { symbol, twitter_handle });
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
        setLoadingMain(false);
        return;
      }
      
      params.append("feed_type", "both");
      params.append("limit", "10");
      params.append("start", "0");
      
      const url = `${process.env.NEXT_PUBLIC_CREDBUZZ_API_URL}/raids/tweet-feed?${params.toString()}`;
      console.log('Fetching from URL:', url);
      const response = await fetch(url);
      
      if (response.ok) {
        const data: TweetFeedResponse = await response.json();
        console.log('Tweet feed response:', {
          originalTweets: data.result.original_tweets.length,
          mentions: data.result.mentions.length,
          symbol,
          twitter_handle
        });
        setOriginalTweets(data.result.original_tweets);
        setMentions(data.result.mentions);
      } else {
        console.log('Failed to fetch tweets');
        setOriginalTweets([]);
        setMentions([]);
      }
    } catch (error) {
      setOriginalTweets([]);
      setMentions([]);
    } finally {
      setLoadingMain(false);
    }
  };

  const getLeftSectionItems = (): LeftSectionItem[] => {
    const items = isSearching ? searchResults : trendingTokens;
    // Always include pinned community at the top with real data
    return [pinnedCommunityData, ...items];
  };

  const filteredItems = useMemo(() => {
    const items = getLeftSectionItems();
    if (!sidebarFilter.trim()) return items;
    
    return items.filter((item) => {
      // Always include pinned community regardless of filter
      if (item.token_id === "pinned-grok" || item.token_id === pinnedCommunityData.token_id) return true;
      
      return item.symbol.toLowerCase().includes(sidebarFilter.toLowerCase()) ||
        item.name.toLowerCase().includes(sidebarFilter.toLowerCase());
    });
  }, [isSearching, searchResults, trendingTokens, sidebarFilter, pinnedCommunityData]);

  const tweetsToShow = tweetFeedType === "original" ? originalTweets : 
                      tweetFeedType === "mentions" ? mentions : 
                      [...originalTweets, ...mentions];
  
  // Ensure unique tweets by tweet_id to prevent duplicates
  const uniqueTweets = tweetsToShow.filter((tweet, index, self) => 
    index === self.findIndex(t => t.tweet_id === tweet.tweet_id)
  );

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPriceChangeColor = (change: number): string => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-gray-400";
  };

  // LLM Response Generation
  const handleGenerateResponse = async (tweet: Tweet) => {
    setSelectedTweet(tweet);
    setLlmLoading(true);
    setLlmResponse("");
    setEditedResponse("");
    setLlmIntentUrl("");
    try {
      const selectedSymbol = selectedItem && 'symbol' in selectedItem ? selectedItem.symbol : '';
      const requestBody: GenerateResponseRequest = {
        tweet_content: tweet.body,
        tweet_context: {
          author_handle: tweet.author_handle,
          symbol: selectedSymbol,
          sentiment: tweet.sentiment,
          tweet_category: tweet.tweet_category,
        },
        response_type: "supportive",
        tone: "casual",
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CREDBUZZ_API_URL}/raids/generate-response`,
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

  const handlePostToTwitter = () => {
    if (!selectedTweet || !editedResponse) return;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(editedResponse)}&in_reply_to=${selectedTweet.tweet_id}`;
    window.open(url, "_blank");
  };

  const renderLeftSectionItem = (item: LeftSectionItem, index: number) => {
    const isSelected = selectedItem === item;
    const isPinned = item.token_id === "pinned-grok" || item.token_id === pinnedCommunityData.token_id;
    
    return (
      <button
        key={`${isPinned ? 'pinned' : 'token'}-${item.token_id || index}`}
        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left hover:bg-neutral-800 border-2 ${
          isSelected 
            ? "bg-[#00D992]/10 border-[#00D992] shadow-lg shadow-[#00D992]/20" 
            : "border-transparent hover:border-neutral-600"
        } ${
          isPinned && !isSelected 
            ? "bg-neutral-700/30 border-[#00D992]/20" 
            : ""
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold truncate ${isSelected ? "text-[#00D992]" : "text-white"}`}>{item.symbol}</span>
            {isPinned && (
              <Badge variant="outline" className={`text-xs ${
                isSelected 
                  ? "bg-[#00D992]/30 border-[#00D992] text-[#00D992]" 
                  : "bg-[#00D992]/20 border-[#00D992]/50 text-[#00D992]"
              }`}>
                Pinned
              </Badge>
            )}
            {!isPinned && !isSearching && (
              <TrendingUp className="w-3 h-3 text-[#00D992]" />
            )}
            {!isPinned && isSearching && (
              <Search className="w-3 h-3 text-blue-400" />
            )}
          </div>
          <span className="text-xs text-gray-400 truncate">{item.name}</span>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>Mentions: {formatNumber('mention_count_24hr' in item ? item.mention_count_24hr : item.mention_count)}</span>
            <Badge variant="outline" className="text-xs bg-neutral-700 border-neutral-500 text-gray-300">
              {item.chain}
            </Badge>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[url('/landingPageBg.png')] bg-cover bg-no-repeat pt-16 md:pt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex gap-6">
        {/* Left Section */}
        <aside className="w-80 shrink-0 border-r border-neutral-700 pr-4 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
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
            
            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search tokens or handles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 text-sm bg-neutral-800 border-neutral-600 text-white placeholder-gray-400 focus:border-[#00D992] focus:ring-[#00D992]"
              />
            </div>
            
            {/* Filter for current section */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={`Filter ${isSearching ? 'results' : 'tokens'}...`}
                value={sidebarFilter}
                onChange={(e) => setSidebarFilter(e.target.value)}
                className="pl-10 pr-3 py-2 text-sm bg-neutral-800 border-neutral-600 text-white placeholder-gray-400 focus:border-[#00D992] focus:ring-[#00D992]"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingSidebar ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <ul className="space-y-1">
                {filteredItems.map((item, index) => renderLeftSectionItem(item, index))}
              </ul>
            ) : (
              <div className="text-center text-gray-400 py-8">
                {isSearching ? "No search results found." : "No tokens found."}
              </div>
            )}
          </div>
        </aside>

        {/* Right Section - Main Panel */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Item Details */}
          {loadingMain ? (
            <div className="mb-6">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-2" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ) : (
            <div className="bg-neutral-800 border border-neutral-600 rounded-lg p-6 mb-2">
              <div className="flex items-start gap-4">
                <img
                  src={tokenDetails?.profile_image_url || handleDetails?.profile_image_url || "/placeholder.svg"}
                  alt={tokenDetails?.symbol || handleDetails?.author_handle}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{tokenDetails?.symbol || handleDetails?.author_handle}</h1>
                    <Badge variant="outline" className="text-xs bg-neutral-700 border-neutral-500">{tokenDetails?.chain || "N/A"}</Badge>
                    {/* Twitter Profile Link */}
                    {(tokenDetails?.twitter_final || handleDetails?.author_handle) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const twitterHandle = tokenDetails?.twitter_final || handleDetails?.author_handle;
                          if (twitterHandle) {
                            window.open(`https://twitter.com/${twitterHandle}`, "_blank");
                          }
                        }}
                        className="border-neutral-600 text-gray-300 hover:border-[#00D992] hover:text-[#00D992] flex items-center gap-2"
                      >
                        <XLogo className="w-4 h-4" />
                        Twitter
                      </Button>
                    )}
                  </div>
                  <p className="text-gray-300 mb-3">
                    {tokenDetails?.name || handleDetails?.bio || "No description available"}
                    {!handleDetails && tokenDetails?.twitter_final && (
                      <span className="text-xs text-gray-500 block mt-1">
                        (Twitter details unavailable - showing token info only)
                      </span>
                    )}
                  </p>
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
                    <div className="mt-3 flex flex-wrap gap-1">
                      {tokenDetails.narrative.split(", ").map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-neutral-700 border-neutral-500 text-gray-300">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tweet Feed Dropdown */}
          <div className="flex items-center gap-4 mb-2">
            <Select value={tweetFeedType} onValueChange={v => { setTweetFeedType(v as "both" | "original" | "mentions"); setSelectedTweet(null); setLlmResponse(""); setEditedResponse(""); setLlmIntentUrl(""); }}>
              <SelectTrigger className="w-56 bg-neutral-800 border-neutral-600 text-white">
                <SelectValue />
                {/* <ChevronDown className="w-4 h-4 ml-2" /> */}
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-600 text-white">
                <SelectItem value="both">Both</SelectItem>
                <SelectItem value="original" disabled={!handleDetails && Boolean(selectedItem?.twitter_final)}>
                  Original Tweets
                </SelectItem>
                <SelectItem value="mentions">Mentions</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-gray-400 text-sm">({uniqueTweets.length} tweets)</span>
            {!handleDetails && selectedItem?.twitter_final && (
              <span className="text-xs text-yellow-400">
                (Original tweets unavailable - showing mentions only)
              </span>
            )}
            {tweetFeedType === "both" && (
              <span className="text-xs text-gray-400">
                ({originalTweets.length} original, {mentions.length} mentions)
              </span>
            )}
          </div>

          {/* Main Content: Tweets and LLM Response */}
          <div className="flex flex-row gap-6 min-h-[400px]">
            {/* Tweets List */}
            <div className="flex-1 min-w-[300px]">
              <div className="space-y-4">
                {loadingMain ? (
                  Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32" />)
                ) : uniqueTweets.length > 0 ? (
                  uniqueTweets.map((tweet) => (
                    <Card 
                      key={`${selectedItem?.symbol}-${tweet.tweet_id}`} 
                      className={`bg-neutral-800 border-neutral-600 transition-all hover:bg-neutral-750 hover:border-neutral-500 cursor-pointer ${selectedTweet?.tweet_id === tweet.tweet_id ? "border-[#00D992]" : ""}`}
                      onClick={() => handleGenerateResponse(tweet)}
                    >
                      <CardContent className="p-4">
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
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-100 text-sm truncate">
                                {tweet.author_handle}
                              </span>
                            </div>
                                                    <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-400">
                            {new Date(tweet.tweet_create_time + "Z").toLocaleString()}
                          </div>
                          {tweetFeedType === "both" && (
                            <Badge variant="outline" className={`text-xs ${
                              originalTweets.some(t => t.tweet_id === tweet.tweet_id) 
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                                : 'bg-green-500/20 border-green-500/50 text-green-400'
                            }`}>
                              {originalTweets.some(t => t.tweet_id === tweet.tweet_id) ? 'Author' : 'Mention'}
                            </Badge>
                          )}
                          {tweet.sentiment !== 0 && (
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              tweet.sentiment > 0 
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://twitter.com/i/status/${tweet.tweet_id}`, "_blank")}
                            className="text-gray-400 hover:text-[#00D992] p-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                        {tweet.mentioned_author_handle && (
                          <div className="mb-2 text-xs text-gray-500">
                            Replying to <span className="text-blue-400">@{tweet.mentioned_author_handle}</span>
                          </div>
                        )}
                        <div className="mb-2">
                          <p className="text-gray-300 text-sm leading-relaxed break-words whitespace-pre-wrap">
                            {tweet.body}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1 hover:text-blue-400 cursor-pointer transition-colors">
                              <ReplyIcon className="w-4 h-4" />
                              <span>{formatNumber(tweet.reply_count)}</span>
                            </div>
                            <div className="flex items-center gap-1 hover:text-green-400 cursor-pointer transition-colors">
                              <RetweetIcon className="w-4 h-4" />
                              <span>{formatNumber(tweet.retweet_count)}</span>
                            </div>
                            <div className="flex items-center gap-1 hover:text-pink-400 cursor-pointer transition-colors">
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
                            {selectedTweet?.tweet_id === tweet.tweet_id ? (
                              <div className="flex items-center gap-2 text-[#00D992]">
                                {llmLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00D992]"></div>
                                    <span className="text-xs">Generating...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-xs">AI Selected</span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateResponse(tweet);
                                }}
                                className="text-gray-400 hover:text-[#00D992] hover:bg-[#00D992]/10 p-1"
                                title="Generate AI Response"
                              >
                                <Sparkles className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : loadingMain ? (
                  <div className="text-center py-8 text-gray-400">Loading tweets...</div>
                ) : (
                  <div className="text-center py-8 text-gray-400">No tweets found</div>
                )}
              </div>
            </div>

            {/* LLM Response and Edit Box */}
            <div className="shrink-0 min-w-[200px]">
              {selectedTweet && (
                <Card className="bg-neutral-800 border-[#00D992]">
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <div className="text-xs text-gray-400 mb-1">AI Response:</div>
                      {/* <div className="text-sm text-gray-200 mb-2">{selectedTweet.body}</div> */}
                    </div>
                    <div className="mb-2">
                      <textarea
                        className="w-full min-h-[100px] bg-neutral-900 border border-neutral-600 rounded-lg p-2 text-white text-sm focus:border-[#00D992] focus:ring-[#00D992]"
                        value={editedResponse}
                        onChange={handleEditResponse}
                        placeholder="AI-generated response will appear here..."
                        disabled={llmLoading}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handlePostToTwitter}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={!editedResponse || llmLoading}
                      >
                        Post to Twitter
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => { setSelectedTweet(null); setLlmResponse(""); setEditedResponse(""); setLlmIntentUrl(""); }}
                        className="border-neutral-600 text-gray-300 hover:border-[#00D992] hover:text-[#00D992]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 