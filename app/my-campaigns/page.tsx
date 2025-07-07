"use client";

import CampaignCard from "@/components/CampaignCard";
import EarnMini from "@/components/EarnMini";
import SelfIntegration from "@/components/SelfIntegration";
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
import { Campaign } from "@/lib/types";
import { usePrivy } from "@privy-io/react-auth";
import {
  Clock,
  Copy,
  Download,
  Loader2,
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
  const [activeTab, setActiveTab] = useState<"earn" | "campaigns" | "identity">(
    "earn"
  );
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
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
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
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#00D992] mx-auto mb-4" />
          <p className="text-gray-400">Loading your campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
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
        smartFollowers: (user.smart_followers || 0).toString(),
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
        smartFollowers: (user.smart_followers || 0).toString(),
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
    <div className="min-h-screen bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 sm:pt-8">
        {/* Profile Header */}
        {user && (
          <div className="flex flex-col lg:flex-row justify-between gap-6 items-start mb-6">
            {/* Profile info section */}
            <div className="flex flex-col gap-4 sm:gap-8 w-full">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative">
                  <img
                    src={user.profile_image_url || "/placeholder-user.jpg"}
                    alt={user.name || user.x_handle}
                    className="w-16 sm:w-20 h-16 sm:h-20 rounded-[8px] object-cover border-2 border-[#00D992]/30"
                  />
                  <span className="absolute -top-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 bg-[#00D992] border-2 border-gray-900 rounded-full" />
                </div>
                <div className="flex flex-col gap-1 sm:gap-2 items-center sm:items-start text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-100">
                    {user.name || user.x_handle}
                  </h2>
                  <p className="text-sm sm:text-base text-[#9CA7A4]">
                    @{user.x_handle}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                {/* About SAGE dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-sm sm:text-base bg-transparent border-[#2D3B39] text-[#9CA7A4] hover:bg-gray-700 hover:text-gray-100"
                    >
                      How to earn
                      <span className="text-[#A9F0DF]"> $SAGE</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1A1D1CA6] backdrop-blur-sm border-gray-800 max-w-lg">
                    <DialogHeader className="text-center">
                      <DialogTitle className="text-[#DFFCF6] text-base sm:text-lg md:text-2xl font-semibold text-center">
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
                        <AccordionTrigger className="text-[#DFFCF6] text-lg sm:text-xl">
                          What's SAGE?
                        </AccordionTrigger>
                        <AccordionContent className="text-[#CFCFCF] text-xs sm:text-sm">
                          SAGE are points you earn for posting quality content
                          that resonates with the crypto Twitter (CT) community
                          about projects that have active campaigns.
                        </AccordionContent>
                      </AccordionItem>

                      {/* How to earn SAGE */}
                      <AccordionItem value="item-2" className="border-none">
                        <AccordionTrigger className="text-[#DFFCF6] text-lg sm:text-xl">
                          How to earn SAGE?
                        </AccordionTrigger>
                        <AccordionContent className="text-[#CFCFCF] text-xs sm:text-sm">
                          <ul className="list-disc list-inside space-y-2">
                            <li>
                              Post high-quality content that aligns with
                              projects' narratives.
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
                        <AccordionTrigger className="text-[#DFFCF6] text-lg sm:text-xl">
                          How is SAGE awarded?
                        </AccordionTrigger>
                        <AccordionContent className="text-[#CFCFCF] text-xs sm:text-sm">
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
                      className="text-sm sm:text-base bg-transparent border-[#2D3B39] text-[#9CA7A4] hover:bg-gray-700 hover:text-gray-100"
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
                    <Button className="text-sm sm:text-base bg-[#00D992] text-[#060F11] hover:bg-[#00D992]/90 font-semibold">
                      View social card
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="bg-[#1A1D1CA6] backdrop-blur-sm border-gray-800 max-w-xl mx-0">
                    {/* Header */}
                    <div className="text-left space-y-1">
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-100">
                        Earn 10 SAGE
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-400">
                        For every person who joins using your invite
                      </p>
                    </div>

                    {/* Social preview card */}
                    <div className="w-full">
                      <img
                        src={
                          user
                            ? `/api/social-card?${new URLSearchParams({
                                name: user.name || "TrendSage",
                                handle: user.x_handle || "0xtrendsage",
                                smartFollowers: (
                                  user.smart_followers || 0
                                ).toString(),
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
                        className="text-xs sm:text-sm bg-transparent border-[#2B3C39]"
                      >
                        {isSocialCardCopying ? (
                          <>
                            <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin mr-1 sm:mr-2" />
                            Copying...
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                            Copy Card
                          </>
                        )}
                      </Button>
                      <Button
                        className="text-xs sm:text-sm bg-[#00D992] text-[#060F11] hover:bg-[#00D992]/90"
                        onClick={downloadSocialCard}
                        disabled={isSocialCardDownloading}
                      >
                        {isSocialCardDownloading ? (
                          <>
                            <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin mr-1 sm:mr-2" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Wallets section */}
            <div className="w-full lg:w-60 flex flex-col gap-2 items-center lg:items-start">
              {user.evm_wallet && (
                <div className="flex items-center justify-between w-full max-w-sm lg:max-w-none p-2 rounded-lg bg-gray-800/50 border border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#627EEA]/10 flex items-center justify-center">
                      <img src="/eth.svg" alt="ETH" className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">EVM Wallet</p>
                      <p className="text-sm text-gray-200 font-mono">
                        {user.evm_wallet.substring(0, 6)}...
                        {user.evm_wallet.substring(user.evm_wallet.length - 4)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user.evm_wallet);
                      toast({
                        title: "Address copied!",
                        description: "EVM wallet address copied to clipboard",
                        duration: 2000,
                      });
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}

              {user.solana_wallet && (
                <div className="flex items-center justify-between w-full max-w-sm lg:max-w-none p-2 rounded-lg bg-gray-800/50 border border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#9945FF]/10 flex items-center justify-center">
                      <img src="/sol.svg" alt="SOL" className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Solana Wallet</p>
                      <p className="text-sm text-gray-200 font-mono">
                        {user.solana_wallet.substring(0, 6)}...
                        {user.solana_wallet.substring(
                          user.solana_wallet.length - 4
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user.solana_wallet);
                      toast({
                        title: "Address copied!",
                        description:
                          "Solana wallet address copied to clipboard",
                        duration: 2000,
                      });
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}

              {/* {user.celo_wallet && (
                <div className="flex items-center justify-between w-full max-w-sm lg:max-w-none p-2 rounded-lg bg-gray-800/50 border border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#FCFF52]/10 flex items-center justify-center">
                      <img src="/celo.svg" alt="CELO" className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Celo Wallet</p>
                      <p className="text-sm text-gray-200 font-mono">
                        {user.celo_wallet.substring(0, 6)}...
                        {user.celo_wallet.substring(
                          user.celo_wallet.length - 4
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user.celo_wallet);
                      toast({
                        title: "Address copied!",
                        description: "Celo wallet address copied to clipboard",
                        duration: 2000,
                      });
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )} */}
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
              <button
                onClick={() => setActiveTab("identity")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "identity"
                    ? "border-[#00D992] text-[#00D992]"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                Identity
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

        {/* Identity Verification Tab Content */}
        {activeTab === "identity" && (
          <div className="">
            <SelfIntegration />
          </div>
        )}

        {/* Campaigns Management */}
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            {/* Campaign Sub-navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              <div className="flex items-center bg-gray-800 p-1 rounded-lg w-full sm:w-auto">
                <button
                  onClick={() => setCampaignSubTab("created")}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    campaignSubTab === "created"
                      ? "bg-[#00D992] text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <span>Created</span>
                    <span className="text-xs bg-gray-900/20 px-2 py-0.5 rounded-full">
                      {filteredCreatedCampaigns.length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setCampaignSubTab("received")}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    campaignSubTab === "received"
                      ? "bg-[#00D992] text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <span>Received</span>
                    <span className="text-xs bg-gray-900/20 px-2 py-0.5 rounded-full">
                      {filteredReceivedCampaigns.length}
                    </span>
                  </div>
                </button>
              </div>

              {/* Campaign Type Toggle */}
              <div className="flex items-center bg-gray-800 p-1 rounded-lg w-full sm:w-auto">
                <button
                  onClick={() => setCampaignType("Targeted")}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    campaignType === "Targeted"
                      ? "bg-[#00D992] text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
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
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    campaignType === "Public"
                      ? "bg-[#00D992] text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
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
                      <div className="text-gray-400 mb-4">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">
                          No created campaigns found
                        </p>
                        <p className="text-sm">
                          Create your first campaign to get started
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCreatedCampaigns.map((campaign) => (
                      <CampaignCard
                        key={campaign.campaign_id}
                        campaign={campaign}
                      />
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
                      <CampaignCard
                        key={campaign.campaign_id}
                        campaign={campaign}
                      />
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
