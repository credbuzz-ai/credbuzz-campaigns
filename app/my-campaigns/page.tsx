"use client";

import EarnMini from "@/components/EarnMini";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";
import { Campaign, Token } from "@/lib/types";
import { usePrivy } from "@privy-io/react-auth";
import {
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  DollarSign,
  Download,
  Loader2,
  Pause,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UpdateWalletDialog from "../components/UpdateWalletDialog";

export default function MyCampaigns() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { toast } = useToast();
  // Top-level tabs: earn rewards vs manage campaigns
  const [activeTab, setActiveTab] = useState<"earn" | "campaigns">("earn");
  const [campaignSubTab, setCampaignSubTab] = useState<"created" | "received">(
    "created"
  );
  const [campaignType, setCampaignType] = useState<"Targeted" | "Public">(
    "Targeted"
  );
  const { user } = useUser();
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);

  // Separate state for open and closed campaigns
  const [openCampaigns, setOpenCampaigns] = useState<Campaign[]>([]);
  const [closedCampaigns, setClosedCampaigns] = useState<Campaign[]>([]);
  const [receivedCampaigns, setReceivedCampaigns] = useState<Campaign[]>([]);
  const [isSocialCardCopying, setIsSocialCardCopying] =
    useState<boolean>(false);
  const [isSocialCardDownloading, setIsSocialCardDownloading] =
    useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Token list state
  const [tokens, setTokens] = useState<Token[]>([]);

  // Fetch tokens from backend on mount
  useEffect(() => {
    apiClient.get("/campaign/list-payment-tokens").then((res) => {
      const tokensData = res.data;
      setTokens(
        tokensData.map((t: any) => ({
          value: t.token_symbol,
          address: t.token_address,
          symbol: t.token_symbol,
          decimals: t.token_decimals,
        }))
      );
    });
  }, []);

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
          owner_x_handle: user.x_handle,
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
      case "published":
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
      case "published":
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getCountdown = (dateString: string) => {
    try {
      const endDate = new Date(dateString);
      if (isNaN(endDate.getTime())) {
        return null;
      }

      const now = new Date();
      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) {
        return { expired: true, text: "Expired" };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        return { expired: false, text: `${days}d ${hours}h remaining` };
      } else if (hours > 0) {
        return { expired: false, text: `${hours}h ${minutes}m remaining` };
      } else {
        return { expired: false, text: `${minutes}m remaining` };
      }
    } catch (error) {
      return null;
    }
  };

  const getTokenSymbol = (
    tokenAddress: string | undefined,
    chain: string | undefined
  ) => {
    if (!tokenAddress) return "TOKEN";
    const found = tokens.find(
      (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
    );
    return found?.symbol || (chain?.toLowerCase() === "solana" ? "SOL" : "ETH");
  };

  // Combine open and closed campaigns for created campaigns display
  const allCreatedCampaigns = [...openCampaigns, ...closedCampaigns];

  // Filter campaigns based on type
  const filteredCreatedCampaigns = allCreatedCampaigns.filter((campaign) =>
    campaignType === "Targeted"
      ? campaign.campaign_type === "Targeted"
      : campaign.campaign_type !== "Targeted"
  );

  const filteredReceivedCampaigns = receivedCampaigns.filter((campaign) =>
    campaignType === "Targeted"
      ? campaign.campaign_type === "Targeted"
      : campaign.campaign_type !== "Targeted"
  );

  const handleCampaignClick = (campaignId: string) => {
    router.push(`/my-campaigns/${campaignId}`);
  };

  const copySocialCard = async () => {
    if (!user) return;

    try {
      setIsSocialCardCopying(true);

      // Generate social card using server-side API
      const params = new URLSearchParams({
        name: user.name || "TrendSage",
        handle: user.x_handle || "0xtrendsage",
        followers: (user.followers || 0).toString(),
        rewards: (user.total_points || 0).toString(),
        profileImage: user.profile_image_url || "",
      });

      const response = await fetch(`/api/social-card?${params}`);
      if (!response.ok) throw new Error("Failed to generate social card");

      const blob = await response.blob();

      const referralUrl = `https://trendsage.xyz?referral_code=${user?.referral_code}`;

      // Create the promotional text
      const socialText = `🚀 Join me on @0xtrendsage, where Web3 influence meets rewards! \n\n📊 Check out my stats and achievements on TrendSage.\n\n🎁 Use my referral link to get 10 SAGE when you join and follow @0xtrendsage\n${referralUrl}\n\nLet's build our Web3 credibility together! 🌟`;

      try {
        // Create a ClipboardItem with both text and image
        const clipboardContent = [
          new ClipboardItem({
            "text/plain": new Blob([socialText], { type: "text/plain" }),
            "image/png": blob,
          }),
        ];

        await navigator.clipboard.write(clipboardContent);
        toast({
          title: "Social card copied!",
          description:
            "Image and text copied to clipboard. You can now paste them anywhere",
          duration: 2000,
        });
      } catch (err) {
        // Fallback: Try to copy text and image separately
        try {
          await navigator.clipboard.writeText(socialText);
          const data = new ClipboardItem({
            "image/png": blob,
          });
          await navigator.clipboard.write([data]);
          toast({
            title: "Social card copied!",
            description:
              "Image and text copied to clipboard. You can now paste them anywhere",
            duration: 2000,
          });
        } catch (fallbackErr) {
          throw fallbackErr;
        }
      }
    } catch (error) {
      console.error("Error copying social card:", error);
      toast({
        title: "Failed to copy social card",
        description: "Please try again",
        duration: 2000,
      });
    } finally {
      setIsSocialCardCopying(false);
    }
  };

  const downloadSocialCard = async () => {
    if (!user) return;

    try {
      setIsSocialCardDownloading(true);

      // Generate social card using server-side API
      const params = new URLSearchParams({
        name: user.name || "TrendSage",
        handle: user.x_handle || "0xtrendsage",
        followers: (user.followers || 0).toString(),
        rewards: (user.total_points || 0).toString(),
        profileImage: user.profile_image_url || "",
      });

      const response = await fetch(`/api/social-card?${params}`);
      if (!response.ok) throw new Error("Failed to generate social card");

      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `trendsage-social-card-${user?.x_handle || "user"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Social card downloaded!",
        description: "Check your downloads folder",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error downloading social card:", error);
      toast({
        title: "Failed to download social card",
        description: "Please try again",
        duration: 2000,
      });
    } finally {
      setIsSocialCardDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        {user && (
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row justify-between gap-6 items-center mb-6">
              {/* Avatar & basic info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={user.profile_image_url || "/placeholder-user.jpg"}
                    alt={user.name || user.x_handle}
                    className="w-20 h-20 rounded-[8px] object-cover border-2 border-[#00D992]/30"
                  />
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#00D992] border-2 border-gray-900 rounded-full" />
                </div>
                <div className="flex flex-col gap-2 items-start">
                  <h2 className="text-2xl font-bold text-gray-100">
                    {user.name || user.x_handle}
                  </h2>
                  <p className="text-[#9CA7A4]">@{user.x_handle}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start">
                <p className="text-[#9CA7A4]">
                  {user.evm_wallet &&
                    "EVM Wallet: " +
                      user.evm_wallet.substring(0, 6) +
                      "..." +
                      user.evm_wallet.substring(user.evm_wallet.length - 4)}
                </p>
                <p className="text-[#9CA7A4]">
                  {user.solana_wallet &&
                    "SOL Wallet: " +
                      user.solana_wallet.substring(0, 6) +
                      "..." +
                      user.solana_wallet.substring(
                        user.solana_wallet.length - 4
                      )}
                </p>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {/* About SAGE dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-transparent border-[#2D3B39] text-[#9CA7A4] hover:bg-gray-700 hover:text-gray-100"
                  >
                    How to earn<span className="text-[#A9F0DF]"> $SAGE</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1A1D1CA6] backdrop-blur-sm border-gray-800 max-w-lg">
                  <DialogHeader className="text-center">
                    <DialogTitle className="text-[#DFFCF6] text-lg md:text-2xl font-semibold text-center">
                      How to earn SAGE?
                    </DialogTitle>
                  </DialogHeader>

                  {/* Accordion */}
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="item-1"
                    className="mt-4"
                  >
                    {/* What is SAGE */}
                    <AccordionItem value="item-1" className="border-none">
                      <AccordionTrigger className="text-[#DFFCF6] text-xl">
                        What's SAGE?
                      </AccordionTrigger>
                      <AccordionContent className="text-[#CFCFCF] text-sm">
                        SAGE are points you earn for posting quality content
                        that resonates with the crypto Twitter (CT) community
                        about projects that have active campaigns.
                      </AccordionContent>
                    </AccordionItem>

                    {/* How to earn SAGE */}
                    <AccordionItem value="item-2" className="border-none">
                      <AccordionTrigger className="text-[#DFFCF6] text-xl">
                        How to earn SAGE?
                      </AccordionTrigger>
                      <AccordionContent className="text-[#CFCFCF] text-sm">
                        <ul className="list-disc list-inside space-y-2">
                          <li>
                            Post high-quality content that aligns with projects'
                            narratives.
                          </li>
                          <li>Create original, educational content.</li>
                          <li>
                            Invite your friends and earn SAGE for each invite.
                          </li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    {/* How SAGE is awarded */}
                    <AccordionItem value="item-3" className="border-none">
                      <AccordionTrigger className="text-[#DFFCF6] text-xl">
                        How is SAGE awarded?
                      </AccordionTrigger>
                      <AccordionContent className="text-[#CFCFCF] text-sm">
                        <p>
                          Projects with active campaigns set custom narrative
                          guidelines and rules to determine how SAGE are
                          rewarded in their leaderboards.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </DialogContent>
              </Dialog>
              <Dialog
                open={isWalletDialogOpen}
                onOpenChange={setIsWalletDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-transparent border-[#2D3B39] text-[#9CA7A4] hover:bg-gray-700 hover:text-gray-100"
                  >
                    Update Wallets
                  </Button>
                </DialogTrigger>
                <UpdateWalletDialog
                  onClose={() => setIsWalletDialogOpen(false)}
                />
              </Dialog>

              {/* View social card popup */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#00D992] text-[#060F11] hover:bg-[#00D992]/90 font-semibold">
                    View social card
                  </Button>
                </DialogTrigger>

                <DialogContent className="bg-[#1A1D1CA6] backdrop-blur-sm border-gray-800 max-w-xl">
                  {/* Header */}
                  <div className="text-left space-y-1">
                    <h2 className="text-2xl font-semibold text-gray-100">
                      Earn 10 SAGE
                    </h2>
                    <p className="text-gray-400 text-sm">
                      For every person who joins using your invite
                    </p>
                  </div>

                  {/* Social preview card */}
                  {/* <SocialCard /> */}
                  <div className="w-full">
                    <img
                      src={
                        user
                          ? `/api/social-card?${new URLSearchParams({
                              name: user.name || "TrendSage",
                              handle: user.x_handle || "0xtrendsage",
                              followers: (user.followers || 0).toString(),
                              rewards: (user.total_points || 0).toString(),
                              profileImage: user.profile_image_url || "",
                            })}`
                          : "/api/social-card"
                      }
                      alt="Social Card Preview"
                      className="w-full h-auto rounded-lg border border-gray-600/30 shadow-lg"
                      style={{ aspectRatio: "1200/628" }}
                    />
                  </div>
                  {/* Action buttons */}
                  <div className="flex gap-2 justify-end mt-2">
                    <Button
                      variant="outline"
                      onClick={copySocialCard}
                      disabled={isSocialCardCopying}
                      className="bg-transparent border-[#2B3C39]"
                    >
                      {isSocialCardCopying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Copying...
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Card
                        </>
                      )}
                    </Button>
                    <Button
                      className="bg-[#00D992] text-[#060F11] hover:bg-[#00D992]/90"
                      onClick={downloadSocialCard}
                      disabled={isSocialCardDownloading}
                    >
                      {isSocialCardDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-700 mb-8">
          <div className="flex justify-between items-center">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("earn")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "earn"
                    ? "border-[#00D992] text-[#00D992]"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                Earn SAGE
              </button>
              <button
                onClick={() => setActiveTab("campaigns")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "campaigns"
                    ? "border-[#00D992] text-[#00D992]"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                Campaigns
              </button>
            </nav>
          </div>
        </div>

        {/* Earn Tab Content */}
        {activeTab === "earn" && (
          <div className="">
            <EarnMini />
          </div>
        )}

        {/* Campaigns Management */}
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            {/* Campaign Sub-navigation */}
            <div className="flex justify-between items-center">
              <div className="flex items-center bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setCampaignSubTab("created")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    campaignSubTab === "created"
                      ? "bg-[#00D992] text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>Created</span>
                    <span className="text-xs bg-gray-900/20 px-2 py-0.5 rounded-full">
                      {filteredCreatedCampaigns.length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setCampaignSubTab("received")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    campaignSubTab === "received"
                      ? "bg-[#00D992] text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>Received</span>
                    <span className="text-xs bg-gray-900/20 px-2 py-0.5 rounded-full">
                      {filteredReceivedCampaigns.length}
                    </span>
                  </div>
                </button>
              </div>

              {/* Campaign Type Toggle */}
              <div className="flex items-center bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setCampaignType("Targeted")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    campaignType === "Targeted"
                      ? "bg-[#00D992] text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>Targeted</span>
                    {campaignType === "Targeted" && (
                      <span className="text-xs bg-gray-900/20 px-2 py-0.5 rounded-full">
                        {campaignSubTab === "created"
                          ? filteredCreatedCampaigns.length
                          : filteredReceivedCampaigns.length}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setCampaignType("Public")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    campaignType === "Public"
                      ? "bg-[#00D992] text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>Public</span>
                    {campaignType === "Public" && (
                      <span className="text-xs bg-gray-900/20 px-2 py-0.5 rounded-full">
                        {campaignSubTab === "created"
                          ? filteredCreatedCampaigns.length
                          : filteredReceivedCampaigns.length}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Created Campaigns Content */}
            {campaignSubTab === "created" && (
              <div className="space-y-6">
                {filteredCreatedCampaigns.length === 0 ? (
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
                    {filteredCreatedCampaigns.map((campaign) => (
                      <div
                        key={campaign.campaign_id}
                        onClick={() =>
                          handleCampaignClick(campaign.campaign_id)
                        }
                        className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-[#00D992]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#00D992]/10 cursor-pointer"
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
                                campaign.payment_token_address,
                                campaign.chain
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-gray-700">
                          <div className="text-xs text-gray-400 mb-2">
                            <div className="flex items-center gap-1 mb-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Ends: {formatDate(campaign.offer_end_date)}
                              </span>
                            </div>
                            {(() => {
                              const countdown = getCountdown(
                                campaign.offer_end_date
                              );
                              if (countdown) {
                                return (
                                  <div
                                    className={`text-xs font-medium ${
                                      countdown.expired
                                        ? "text-red-400"
                                        : "text-[#00D992]"
                                    }`}
                                  >
                                    {countdown.text}
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>

                          {campaign.owner_x_handle && (
                            <div className="text-xs mb-2">
                              <span className="text-gray-400">X Handle: </span>
                              <span className="text-[#00D992]">
                                @{campaign.owner_x_handle}
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

            {/* Received Campaigns Content */}
            {campaignSubTab === "received" && (
              <div className="space-y-6">
                {filteredReceivedCampaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">
                        No received campaigns found
                      </p>
                      <p className="text-sm">
                        Campaign invitations will appear here
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredReceivedCampaigns.map((campaign) => (
                      <div
                        key={campaign.campaign_id}
                        onClick={() =>
                          handleCampaignClick(campaign.campaign_id)
                        }
                        className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-[#00D992]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#00D992]/10 cursor-pointer"
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
                            {campaign.owner_x_handle ||
                              `Brand ${campaign.owner_x_handle}`}
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
                                campaign.payment_token_address,
                                campaign.chain
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-gray-700">
                          <div className="text-xs text-gray-400 mb-2">
                            <div className="flex items-center gap-1 mb-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Ends: {formatDate(campaign.offer_end_date)}
                              </span>
                            </div>
                            {(() => {
                              const countdown = getCountdown(
                                campaign.offer_end_date
                              );
                              if (countdown) {
                                return (
                                  <div
                                    className={`text-xs font-medium ${
                                      countdown.expired
                                        ? "text-red-400"
                                        : "text-[#00D992]"
                                    }`}
                                  >
                                    {countdown.text}
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>

                          {campaign.owner_x_handle && (
                            <div className="text-xs mb-3">
                              <span className="text-gray-400">X Handle: </span>
                              <span className="text-[#00D992]">
                                @{campaign.owner_x_handle}
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
          </div>
        )}
      </div>
    </div>
  );
}
