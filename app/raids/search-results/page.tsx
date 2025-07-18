"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, Hash, ExternalLink, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Token {
  token_id: string;
  symbol: string;
  name: string;
  chain: string;
  twitter_final: string;
  profile_image_url: string;
  mention_count_24hr: number;
  marketcap: number;
}

interface Handle {
  author_handle: string;
  profile_image_url: string;
  followers_count: number;
  bio: string;
}

interface SearchResultsResponse {
  result: {
    tokens: Token[];
    handles: Handle[];
  };
  message: string;
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchTerm = searchParams.get("q") || "";
  
  const [tokens, setTokens] = useState<Token[]>([]);
  const [handles, setHandles] = useState<Handle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (searchTerm) {
      fetchSearchResults();
    }
  }, [searchTerm]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CREDBUZZ_API_URL}/raids/search?search_term=${encodeURIComponent(searchTerm)}&limit=20`
      );
      
      if (response.ok) {
        const data: SearchResultsResponse = await response.json();
        setTokens(data.result.tokens || []);
        setHandles(data.result.handles || []);
      } else {
        console.error("Failed to fetch search results");
        setTokens([]);
        setHandles([]);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setTokens([]);
      setHandles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenClick = (token: Token) => {
    router.push(`/raids/${token.symbol}`);
  };

  const handleHandleClick = (handle: Handle) => {
    router.push(`/raids/${handle.author_handle}`);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTotalResults = () => {
    return tokens.length + handles.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/raids")}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Raids
          </Button>
        </div>

        {/* Search Results Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-6 h-6 text-[#00D992]" />
            <h1 className="text-2xl font-bold">
              Search Results for "{searchTerm}"
            </h1>
          </div>
          <p className="text-gray-400">
            Found {getTotalResults()} result{getTotalResults() !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-neutral-800 border border-neutral-600">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#00D992] data-[state=active]:text-black">
              All ({getTotalResults()})
            </TabsTrigger>
            <TabsTrigger value="tokens" className="data-[state=active]:bg-[#00D992] data-[state=active]:text-black">
              Tokens ({tokens.length})
            </TabsTrigger>
            <TabsTrigger value="handles" className="data-[state=active]:bg-[#00D992] data-[state=active]:text-black">
              Handles ({handles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-6">
              {/* Tokens Section */}
              {tokens.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Hash className="w-5 h-5 text-[#00D992]" />
                    <h2 className="text-xl font-semibold">Tokens</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tokens.map((token) => (
                      <Card
                        key={token.token_id}
                        className="bg-neutral-800 border-neutral-600 hover:border-[#00D992]/50 transition-all cursor-pointer group"
                        onClick={() => handleTokenClick(token)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={token.profile_image_url || "/placeholder.svg"}
                              alt={token.symbol}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white truncate">
                                  ${token.symbol}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-400 truncate">
                                {token.name}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Mentions (24h)</span>
                              <span className="text-white font-medium">
                                {formatNumber(token.mention_count_24hr)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Market Cap</span>
                              <span className="text-white font-medium">
                                {formatNumber(token.marketcap)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                              {token.chain}
                            </span>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#00D992] transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Handles Section */}
              {handles.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-[#00D992]" />
                    <h2 className="text-xl font-semibold">Twitter Handles</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {handles.map((handle) => (
                      <Card
                        key={handle.author_handle}
                        className="bg-neutral-800 border-neutral-600 hover:border-[#00D992]/50 transition-all cursor-pointer group"
                        onClick={() => handleHandleClick(handle)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={handle.profile_image_url || "/placeholder.svg"}
                              alt={handle.author_handle}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white truncate">
                                @{handle.author_handle}
                              </h3>
                              <p className="text-sm text-gray-400 truncate">
                                {handle.bio || "No bio available"}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Followers</span>
                              <span className="text-white font-medium">
                                {formatNumber(handle.followers_count)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-end">
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#00D992] transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tokens" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tokens.length > 0 ? (
                tokens.map((token) => (
                  <Card
                    key={token.token_id}
                    className="bg-neutral-800 border-neutral-600 hover:border-[#00D992]/50 transition-all cursor-pointer group"
                    onClick={() => handleTokenClick(token)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={token.profile_image_url || "/placeholder.svg"}
                          alt={token.symbol}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white truncate">
                              ${token.symbol}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-400 truncate">
                            {token.name}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Mentions (24h)</span>
                          <span className="text-white font-medium">
                            {formatNumber(token.mention_count_24hr)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Market Cap</span>
                          <span className="text-white font-medium">
                            {formatNumber(token.marketcap)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {token.chain}
                        </span>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#00D992] transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Hash className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    No Tokens Found
                  </h3>
                  <p className="text-gray-500">
                    No tokens match your search for "{searchTerm}"
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="handles" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {handles.length > 0 ? (
                handles.map((handle) => (
                  <Card
                    key={handle.author_handle}
                    className="bg-neutral-800 border-neutral-600 hover:border-[#00D992]/50 transition-all cursor-pointer group"
                    onClick={() => handleHandleClick(handle)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={handle.profile_image_url || "/placeholder.svg"}
                          alt={handle.author_handle}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">
                            @{handle.author_handle}
                          </h3>
                          <p className="text-sm text-gray-400 truncate">
                            {handle.bio || "No bio available"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Followers</span>
                          <span className="text-white font-medium">
                            {formatNumber(handle.followers_count)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-end">
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#00D992] transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    No Handles Found
                  </h3>
                  <p className="text-gray-500">
                    No Twitter handles match your search for "{searchTerm}"
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* No Results */}
        {getTotalResults() === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No Results Found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              No tokens or Twitter handles match your search for "{searchTerm}". Try a different search term.
            </p>
            <Button
              onClick={() => router.push("/raids")}
              className="bg-[#00D992] hover:bg-[#00C484] text-black"
            >
              Back to Raids
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 