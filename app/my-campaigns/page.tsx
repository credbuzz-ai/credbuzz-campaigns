"use client";

import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";
import { Campaign, allowedBaseTokens, allowedSolanaTokens } from "@/lib/types";
import { usePrivy } from "@privy-io/react-auth";
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  Pause,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function MyCampaigns() {
  const { ready, authenticated } = usePrivy();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"created" | "received">("created");
  const { user } = useUser();

  // Separate state for open and closed campaigns
  const [openCampaigns, setOpenCampaigns] = useState<Campaign[]>([]);
  const [closedCampaigns, setClosedCampaigns] = useState<Campaign[]>([]);
  const [receivedCampaigns, setReceivedCampaigns] = useState<Campaign[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch campaigns data following BusinessDashboard pattern
  const fetchAllCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.x_handle) {
        throw new Error("X handle not found");
      }

      // Initialize arrays
      const openCreated: Campaign[] = [];
      const closedCreated: Campaign[] = [];
      const received: Campaign[] = [];

      // Fetch closed campaigns (same pattern as BusinessDashboard)
      try {
        const closedResponse = await apiClient.post("/campaign/get-campaigns", {
          project_x_handle: user.x_handle,
        });

        if (closedResponse.data?.result) {
          const closedData = closedResponse.data.result;
          closedData.forEach((campaign: Campaign) => {
            // Add mock analytics data
            closedCreated.push({
              ...campaign,
            });
          });
        }
      } catch (error) {
        console.error("Error fetching closed campaigns:", error);
      }

      // Fetch campaigns where user is the influencer (received campaigns)
      try {
        const receivedResponse = await apiClient.post(
          "/campaign/get-campaigns",
          {
            influencer_x_handle: user.x_handle,
          }
        );

        if (receivedResponse.data?.result) {
          const receivedData = receivedResponse.data.result;
          receivedData.forEach((campaign: Campaign) => {
            received.push({
              ...campaign,
            });
          });
        }
      } catch (error) {
        console.error("Error fetching received campaigns:", error);
      }

      // Update state
      setOpenCampaigns(openCreated);
      setClosedCampaigns(closedCreated);
      setReceivedCampaigns(received);
    } catch (err: any) {
      console.error("Error fetching campaigns:", err);
      setError("Failed to load campaigns");
      toast({
        title: "Error",
        description: "Failed to load campaigns. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready && authenticated && user?.x_handle) {
      fetchAllCampaigns();
    }
  }, [ready, authenticated, user]);

  if (!ready || !authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">
            Please connect your account
          </h1>
          <p className="text-gray-400">
            You need to be logged in to view your campaigns.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#00D992] mx-auto mb-4" />
          <p className="text-gray-400">Loading your campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchAllCampaigns}
            className="bg-[#00D992] text-gray-900 px-4 py-2 rounded-lg hover:bg-[#00D992]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "open":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "completed":
      case "fulfilled":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "paused":
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case "pending":
      case "accepted":
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "open":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "completed":
      case "fulfilled":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "paused":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "pending":
      case "accepted":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default:
        return "bg-red-500/10 text-red-400 border-red-500/20";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTokenSymbol = (
    tokenAddress: string | undefined,
    chain: string | undefined
  ) => {
    if (!tokenAddress) return "TOKEN";

    // Check if it's Solana chain
    if (chain?.toLowerCase() === "solana") {
      const solanaToken = allowedSolanaTokens.find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
      );
      return solanaToken?.symbol || "SOL";
    }

    // Check Base/Ethereum chains
    const baseToken = allowedBaseTokens.find(
      (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
    );
    return baseToken?.symbol || "ETH";
  };

  // Combine open and closed campaigns for created campaigns display
  const allCreatedCampaigns = [...openCampaigns, ...closedCampaigns];

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            My Campaigns
          </h1>
          <p className="text-gray-400">
            Manage your created and received campaigns
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("created")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "created"
                  ? "border-[#00D992] text-[#00D992]"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              Created Campaigns ({allCreatedCampaigns.length})
            </button>
            <button
              onClick={() => setActiveTab("received")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "received"
                  ? "border-[#00D992] text-[#00D992]"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              Received Campaigns ({receivedCampaigns.length})
            </button>
          </nav>
        </div>

        {/* Created Campaigns Tab */}
        {activeTab === "created" && (
          <div className="space-y-6">
            {allCreatedCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No created campaigns found</p>
                  <p className="text-sm">
                    Create your first campaign to get started
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {allCreatedCampaigns.map((campaign) => (
                  <div
                    key={campaign.campaign_id}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-[#00D992]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#00D992]/10"
                  >
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-100 mb-2">
                        {campaign.campaign_name || "Untitled Campaign"}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          campaign.status
                        )}`}
                      >
                        {getStatusIcon(campaign.status)}
                        {campaign.status.charAt(0).toUpperCase() +
                          campaign.status.slice(1)}
                      </span>
                    </div>

                    {/* Chain */}
                    <div className="mb-4">
                      <span className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded-md">
                        {campaign.chain}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {campaign.description || "No description available"}
                    </p>

                    {/* Amount */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Amount
                        </span>
                        <span className="text-gray-100 font-semibold">
                          {campaign.amount}{" "}
                          {getTokenSymbol(
                            campaign.token_address,
                            campaign.chain
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-gray-700">
                      <div className="text-xs text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(campaign.offer_end_date)} -{" "}
                        </span>
                      </div>

                      {campaign.project_x_handle && (
                        <div className="text-xs mb-2">
                          <span className="text-gray-400">X Handle: </span>
                          <span className="text-[#00D992]">
                            @{campaign.project_x_handle}
                          </span>
                        </div>
                      )}

                      {campaign.influencer_wallet && (
                        <div className="text-xs">
                          <span className="text-gray-400">Assigned: </span>
                          <span className="text-[#00D992] font-mono">
                            {campaign.influencer_wallet.substring(0, 6)}...
                            {campaign.influencer_wallet.substring(
                              campaign.influencer_wallet.length - 4
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Received Campaigns Tab */}
        {activeTab === "received" && (
          <div className="space-y-6">
            {receivedCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No received campaigns found</p>
                  <p className="text-sm">
                    Campaign invitations will appear here
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {receivedCampaigns.map((campaign) => (
                  <div
                    key={campaign.campaign_id}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-[#00D992]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#00D992]/10"
                  >
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-100 mb-2">
                        {campaign.campaign_name || "Untitled Campaign"}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          campaign.status
                        )}`}
                      >
                        {getStatusIcon(campaign.status)}
                        {campaign.status.charAt(0).toUpperCase() +
                          campaign.status.slice(1)}
                      </span>
                    </div>

                    {/* Brand Info & Chain */}
                    <div className="mb-4">
                      <p className="text-sm text-[#00D992] font-medium mb-2">
                        From:{" "}
                        {campaign.project_x_handle ||
                          `Brand ${campaign.project_x_handle}`}
                      </p>
                      <span className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded-md">
                        {campaign.chain}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {campaign.description || "No description available"}
                    </p>

                    {/* Offer Amount */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Offer Amount
                        </span>
                        <span className="text-gray-100 font-semibold text-lg">
                          {campaign.amount}{" "}
                          {getTokenSymbol(
                            campaign.token_address,
                            campaign.chain
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-gray-700">
                      <div className="text-xs text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(campaign.offer_end_date)} -{" "}
                        </span>
                      </div>

                      {campaign.project_x_handle && (
                        <div className="text-xs mb-3">
                          <span className="text-gray-400">X Handle: </span>
                          <span className="text-[#00D992]">
                            @{campaign.project_x_handle}
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {campaign.status.toLowerCase() === "open" && (
                        <div className="flex gap-2">
                          <button
                            className="flex-1 bg-[#00D992] text-gray-900 py-2 px-3 rounded-lg text-sm font-medium hover:bg-[#00D992]/90 transition-colors"
                            onClick={() => {
                              toast({
                                title: "Campaign Accepted",
                                description: "You have accepted this campaign",
                              });
                            }}
                          >
                            Accept
                          </button>
                          <button
                            className="flex-1 bg-gray-700 text-gray-300 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                            onClick={() => {
                              toast({
                                title: "Campaign Declined",
                                description: "You have declined this campaign",
                              });
                            }}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
