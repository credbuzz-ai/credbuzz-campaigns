"use client";

import CampaignLeaderboard from "@/app/components/CampaignLeaderboard";
import FollowersOverview from "@/app/components/FollowersOverview";
import MentionsFeed from "@/app/components/MentionsFeed";
import MindshareVisualization from "@/app/components/MindshareVisualization";
import { MindshareResponse, UserProfileResponse } from "@/app/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiClient from "@/lib/api";
import { Campaign } from "@/lib/types";
import { BrowserIcon } from "@/public/icons/BrowserIcon";
import { DiscordIcon } from "@/public/icons/DiscordIcon";
import { TgIcon } from "@/public/icons/TgIcon";
import { XIcon } from "@/public/icons/XIcon";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
function linkifyText(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+?)(?=[.,;:!?\)\]\}]*(?:\s|$))/g;
  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00D992] underline hover:text-[#00F5A8]"
        >
          {part}
        </a>
      );
    } else {
      return part;
    }
  });
}

// Expandable Description component for campaign descriptions
const ExpandableDescription = ({ description }: { description: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150; // Maximum characters to show initially

  // If description is shorter than maxLength, show it fully without "..."
  if (description.length <= maxLength) {
    return (
      <div className="text-sm text-gray-300 leading-relaxed">
        <div style={{ whiteSpace: "pre-line" }}>{linkifyText(description)}</div>
      </div>
    );
  }

  const visibleText = isExpanded
    ? description
    : `${description.slice(0, maxLength)}...`;

  return (
    <div className="text-sm text-gray-300 leading-relaxed">
      <div style={{ whiteSpace: "pre-line" }}>{linkifyText(visibleText)}</div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-1 text-[#00D992] hover:text-[#00F5A8] font-medium transition-colors"
      >
        {isExpanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
};

type TimePeriod = "30d" | "7d" | "1d";

interface CampaignDetailsClientProps {
  campaignId: string;
}

// Social Link Component
const SocialLink = ({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className=" rounded-full  "
    title={label}
  >
    <div className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors">
      {icon}
    </div>
  </a>
);

// Category Tag Component
const CategoryTag = ({ label }: { label: string }) => (
  <span className="px-3 py-1 bg-[#00D992]/10 text-[#00D992] rounded-full text-xs font-medium">
    {label}
  </span>
);

// Status Badge Component
const StatusBadge = ({
  status,
}: {
  status: "active" | "ended" | "upcoming";
}) => {
  const statusConfig = {
    active: {
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      label: "Active",
    },
    ended: { color: "text-red-400", bgColor: "bg-red-400/10", label: "Ended" },
    upcoming: {
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
      label: "Upcoming",
    },
  };

  const config = statusConfig[status];
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bgColor} flex items-center gap-1.5`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.color.replace(
          "text-",
          "bg-"
        )}`}
      />
      {config.label}
    </span>
  );
};

// Info Badge Component
const InfoBadge = ({
  icon,
  label,
  href,
  status,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  status?: string;
  detail?: string;
}) => {
  const content = (
    <>
      <div className="p-1.5 rounded-md bg-[#00D992]/10 text-[#00D992]">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-300">
          {status || label}
        </span>
        {detail && <span className="text-xs text-gray-500">{detail}</span>}
      </div>
      {href && (
        <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-[#00D992]" />
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/20 hover:bg-gray-700/30 transition-colors group"
        title={label}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/20"
      title={label}
    >
      {content}
    </div>
  );
};

// Insert helper functions for formatted display
function formatAmount(amount: number): string {
  const formatDecimal = (value: number) => {
    const fixed = value.toFixed(4);
    return fixed.replace(/\.?0+$/, "");
  };

  if (amount >= 1_000_000_000)
    return formatDecimal(amount / 1_000_000_000) + "B";
  if (amount >= 1_000_000) return formatDecimal(amount / 1_000_000) + "M";
  if (amount >= 1_000) return formatDecimal(amount / 1_000) + "K";
  return formatDecimal(amount);
}

function formatNumber(value: number): string {
  if (value >= 1_000_000)
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (value >= 1_000)
    return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return value.toString();
}

function getPriceUsd(tokenSymbol: string): Promise<number | null> {
  // very lightweight fetch to Coingecko; falls back to null if error
  return fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbol.toLowerCase()}&vs_currencies=usd`,
    { next: { revalidate: 60 } }
  )
    .then((r) => r.json())
    .then((d) => d[tokenSymbol.toLowerCase()]?.usd ?? null)
    .catch(() => null);
}

export default function CampaignDetailsClient({
  campaignId,
}: CampaignDetailsClientProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mindshareData, setMindshareData] = useState<MindshareResponse | null>(
    null
  );
  const [visualizationData, setVisualizationData] =
    useState<MindshareResponse | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] =
    useState<TimePeriod>("30d");
  const [activityData, setActivityData] = useState<
    UserProfileResponse["result"]["activity_data"] | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [followersLimit, setFollowersLimit] = useState<20 | 50 | 100>(50);
  const pageSize = 100;
  const [tokenUsdPrice, setTokenUsdPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      if (!campaignId) return;

      try {
        setIsLoading(true);
        const response = await apiClient.post("/campaign/get-campaigns", {
          campaign_id: campaignId,
        });

        if (response.data?.result?.[0]) {
          setCampaign(response.data.result[0]);
        } else {
          setError("Campaign not found");
        }
      } catch (err) {
        console.error("Error fetching campaign details:", err);
        setError("Failed to load campaign details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignDetails();
  }, [campaignId]);

  useEffect(() => {
    const fetchMindshare = async (period: TimePeriod) => {
      if (!campaign?.target_x_handle) return;

      try {
        setLoading(true);
        const handle = campaign.target_x_handle.replace("@", "").toLowerCase();
        const offset = (currentPage - 1) * followersLimit;

        // Reset states before fetching new data
        setMindshareData(null);
        setVisualizationData(null);

        // Fetch paginated data for the leaderboard
        const paginatedResponse = await apiClient.get(
          `/mindshare?project_name=${handle}&limit=${followersLimit}&offset=${offset}&period=${period}`
        );
        setMindshareData(paginatedResponse.data);

        // Use the same limit for visualization data to maintain consistency
        const visualizationResponse = await apiClient.get(
          `/mindshare?project_name=${handle}&limit=${followersLimit}&period=${period}`
        );
        setVisualizationData(visualizationResponse.data);
      } catch (err) {
        console.error(`Error fetching mindshare for ${period}:`, err);
        setMindshareData(null);
        setVisualizationData(null);
      } finally {
        setLoading(false);
      }
    };

    if (campaign?.target_x_handle) {
      fetchMindshare(selectedTimePeriod);
    }
  }, [
    campaign?.target_x_handle,
    selectedTimePeriod,
    currentPage,
    followersLimit,
    pageSize,
  ]);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const handle = campaign?.target_x_handle?.replace("@", "");
        if (!handle) return;

        const response = await fetch(
          `/api/user/get-user-profile?handle=${handle}`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            cache: "no-store",
            signal: AbortSignal.timeout(10000),
          }
        );
        const data = await response.json();
        if (data.result?.activity_data) {
          setActivityData(data.result.activity_data);
        }
      } catch (error) {
        console.error("Error fetching activity data:", error);
      }
    };

    if (campaign?.target_x_handle) {
      fetchActivityData();
    }
  }, [campaign?.target_x_handle]);

  useEffect(() => {
    if (campaign?.payment_token && campaign.amount) {
      getPriceUsd(campaign.payment_token)
        .then((p) => p !== null && setTokenUsdPrice(p))
        .catch(() => {});
    }
  }, [campaign?.payment_token, campaign?.amount]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading || !campaign) {
    return <CampaignSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Helper function to calculate campaign time remaining
  const getCampaignTimeRemaining = () => {
    const endDate = new Date(campaign.offer_end_date);
    const now = new Date();

    if (endDate <= now) {
      return "Campaign ended";
    }

    const totalMinutes = Math.floor(
      (endDate.getTime() - now.getTime()) / 60000
    );
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0)
      return `${days} ${days === 1 ? "day" : "days"} ${hours} ${
        hours === 1 ? "hour" : "hours"
      }`;
    if (hours > 0)
      return `${hours} ${hours === 1 ? "hour" : "hours"} ${minutes} minutes`;
    return `${minutes} minutes`;
  };

  // Helper to format time remaining string with different styles for numbers and labels
  const formatTimeRemainingDisplay = (timeStr: string) => {
    // Split by space to identify numbers and units
    const tokens = timeStr.split(/\s+/);
    return tokens.map((token, idx) => {
      const isNumber = /^\d+$/.test(token);
      const className = isNumber
        ? "text-neutral-100 text-[20px] font-semibold"
        : "text-neutral-300 text-sm";
      return (
        <span key={idx} className={className}>
          {token}
          &nbsp;{!isNumber && " "}
        </span>
      );
    });
  };

  // Get the handle for the smart feed (prefer project_handle, then target, fallback to owner)
  const smartFeedHandle = campaign?.project_handle
    ? campaign?.project_handle.replace("@", "").toLowerCase()
    : campaign?.target_x_handle
    ? campaign?.target_x_handle.replace("@", "").toLowerCase()
    : campaign?.owner_x_handle.replace("@", "").toLowerCase();

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="flex items-start">
        {/* Main Content */}
        <div className="flex-1 py-4 md:py-8 px-0 md:px-8 lg:px-12">
          <div className="max-w-7xl px-0 md:px-4 mx-auto">
            {/* Campaign Header */}
            <Card className="bg-neutral-900 border-none mb-2">
              <div className="p-4 md:p-6">
                <div className="flex flex-col gap-6">
                  {/* Top section */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Left – logo & basic info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="shrink-0">
                        <Image
                          src={
                            campaign?.owner_info?.profile_image_url ||
                            "/placeholder-logo.png"
                          }
                          alt={campaign?.campaign_name}
                          width={56}
                          height={56}
                          className="rounded-lg object-cover"
                        />
                        {/* <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full ring-2 ring-neutral-900" /> */}
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <h1 className="text-2xl font-bold text-gray-100">
                            {campaign?.campaign_name}
                          </h1>
                          {campaign?.target_token_symbol && (
                            <span className="text-sm font-medium text-gray-400">
                              ${campaign?.target_token_symbol}
                            </span>
                          )}

                          {/* Social links */}
                          <div className="flex items-center gap-2 ml-2">
                            {(campaign?.project_handle ||
                              campaign?.target_x_handle ||
                              campaign?.owner_x_handle) && (
                              <SocialLink
                                href={`https://x.com/${(
                                  campaign?.project_handle ||
                                  campaign?.target_x_handle ||
                                  campaign?.owner_x_handle
                                )?.replace("@", "")}`}
                                icon={<XIcon />}
                                label="Twitter"
                              />
                            )}
                            {campaign?.project_telegram && (
                              <SocialLink
                                href={campaign?.project_telegram}
                                icon={<TgIcon />}
                                label="Telegram"
                              />
                            )}
                            {campaign?.project_discord && (
                              <SocialLink
                                href={campaign?.project_discord}
                                icon={<DiscordIcon />}
                                label="Discord"
                              />
                            )}
                            {campaign?.project_website && (
                              <SocialLink
                                href={campaign?.project_website}
                                icon={<BrowserIcon />}
                                label="Website"
                              />
                            )}
                          </div>
                        </div>
                        {/* Categories */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-support-sand text-xs font-semibold">
                            {campaign?.campaign_type}
                          </span>
                          {campaign?.project_categories
                            ?.split(",")
                            .map((category) => (
                              <CategoryTag key={category} label={category} />
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex flex-row flex-wrap gap-8 sm:gap-12">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-neutral-200">
                          Reward pool
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[20px] font-semibold text-neutral-100">
                            {formatAmount(campaign?.amount)}{" "}
                            {campaign?.payment_token}
                          </span>
                          {tokenUsdPrice !== null && (
                            <span className="text-xs text-brand-400">
                              $
                              {(
                                campaign?.amount * tokenUsdPrice
                              ).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <span className="text-sm text-neutral-200">
                          Campaign ends in
                        </span>
                        <span className="text-sm">
                          {formatTimeRemainingDisplay(
                            getCampaignTimeRemaining()
                          )}
                        </span>
                      </div>
                      {/* <div className="flex flex-col">
                        <span className="text-sm text-gray-400">
                          Participants
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-semibold text-gray-100">
                            {formatNumber(campaign?.counter || 0)}
                          </span>
                          {Boolean((campaign as any).sage_distributed) && (
                            <span className="text-xs text-teal-400">
                              {formatNumber((campaign as any).sage_distributed)}{" "}
                              SAGE distributed
                            </span>
                          )}
                        </div>
                      </div> */}
                    </div>
                  </div>

                  {/* Description */}
                  {/* <div className="max-w-3xl">
                    <ExpandableDescription description={campaign.description} />
                  </div> */}

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="px-3 py-1 bg-neutral-800 border border-neutral-500 text-neutral-200 hover:bg-gray-700 hover:text-gray-100">
                          About ❈SAGE
                          {/* <span className="text-[#A9F0DF]"> $SAGE</span> */}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#1A1D1CA6] backdrop-blur-sm border-gray-800 max-w-[calc(100vw-2rem)] md:max-w-lg ">
                        <DialogHeader className="text-center">
                          <DialogTitle className="text-[#DFFCF6] text-lg md:text-2xl font-semibold text-center">
                            About SAGE
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
                              SAGE are points you earn for posting quality
                              content that resonates with the crypto Twitter
                              (CT) community about projects that have active
                              campaigns.
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
                                  Post high-quality content that aligns with
                                  projects' narratives.
                                </li>
                                <li>Create original, educational content.</li>
                                <li>
                                  Invite your friends and earn SAGE for each
                                  invite.
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
                                Projects with active campaigns set custom
                                narrative guidelines and rules to determine how
                                SAGE are rewarded in their leaderboards.
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="px-3 py-1 rounded-md bg-[#00D992] hover:bg-[#00F5A8] text-gray-900 text-sm font-semibold">
                          How can I participate?
                          {/* <span className="text-[#A9F0DF]"> $SAGE</span> */}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#1A1D1CA6] backdrop-blur-sm border-gray-800  max-w-[calc(100vw-2rem)] md:max-w-lg ">
                        <DialogHeader className="text-center">
                          <DialogTitle className="text-[#DFFCF6] text-lg md:text-2xl font-semibold text-center">
                            How can I participate?
                          </DialogTitle>
                        </DialogHeader>

                        {/* Accordion */}
                        <Accordion
                          type="single"
                          collapsible
                          defaultValue="item-1"
                          className="mt-4"
                        >
                          <AccordionItem
                            value="item-1"
                            className="border-none max-h-[500px] overflow-y-auto"
                          >
                            <AccordionTrigger className="text-[#DFFCF6] text-xl">
                              About campaign
                            </AccordionTrigger>
                            <AccordionContent className="text-[#CFCFCF] text-sm">
                              <ExpandableDescription
                                description={campaign?.description}
                              />
                            </AccordionContent>
                          </AccordionItem>

                          {campaign?.campaign_rules && (
                            <AccordionItem
                              value="item-2"
                              className="border-none"
                            >
                              <AccordionTrigger className="text-[#DFFCF6] text-xl">
                                Campaign rules
                              </AccordionTrigger>
                              <AccordionContent className="text-[#CFCFCF] text-sm">
                                <ul className="list-disc list-inside space-y-2">
                                  {campaign?.campaign_rules
                                    ?.split("\n")
                                    .map((rule, index) => (
                                      <li key={index}>{linkifyText(rule)}</li>
                                    ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                        </Accordion>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex-col md:flex-row h-full items-stretch">
              {/* Tabbed Interface for Mindshare and Followers */}
              <div className="w-full md:w-[56%] flex flex-col h-full">
                <Tabs
                  defaultValue="mindshare"
                  className="max-w-[100vw] w-full h-full mt-5"
                >
                  <TabsList className="flex w-full bg-transparent rounded-none p-0">
                    {[
                      { label: "Mindshare", value: "mindshare" },
                      { label: "Followers Overview", value: "followers" },
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex-1 px-0 md:px-4 border-b py-5  border-neutral-600  text-sm  font-medium rounded-none text-gray-400 hover:text-gray-200  data-[state=active]:mb-0 data-[state=active]:bg-transparent data-[state=active]:text-[#00D992] data-[state=active]:border-b-2 data-[state=active]:border-[#00D992] transition-colors bg-transparent"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="mindshare" className="space-y-8 mt-2">
                    {/* Community Mindshare */}
                    <div>
                      <MindshareVisualization
                        data={visualizationData?.result?.mindshare_data || []}
                        selectedTimePeriod={selectedTimePeriod}
                        onTimePeriodChange={(period) => {
                          setSelectedTimePeriod(period as TimePeriod);
                          setCurrentPage(1); // Reset to first page when changing period
                        }}
                        loading={loading}
                        setLoading={setLoading}
                        projectName={campaignId}
                        projectHandle={campaign?.target_x_handle || ""}
                      />
                    </div>

                    {/* Leaderboard moved to Accounts tab in Feed */}
                  </TabsContent>

                  <TabsContent value="followers" className="mt-0">
                    {campaign?.target_x_handle && (
                      <FollowersOverview
                        authorHandle={campaign.target_x_handle.replace("@", "")}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Feed with Accounts/Mentions Tabs */}
              <div className="w-full md:w-[44%] flex flex-col h-full">
                {/* External Time Period Filters */}
                <div className="justify-between  pt-4 border-b border-neutral-600 pb-4 hidden md:flex">
                  {/* Limit buttons */}
                  <div className="flex gap-1 bg-transparent rounded-lg border border-neutral-600">
                    {[20, 50, 100].map((num) => (
                      <button
                        key={num}
                        onClick={() => setFollowersLimit(num as 20 | 50 | 100)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          followersLimit === num
                            ? "bg-neutral-700 text-neutral-100"
                            : "text-neutral-300 hover:text-neutral-100"
                        }`}
                      >
                        Top {num}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1 bg-transparent rounded-lg border border-neutral-600">
                    {["30d", "7d", "1d"].map((period) => (
                      <button
                        key={period}
                        onClick={() => {
                          setSelectedTimePeriod(period as TimePeriod);
                          setCurrentPage(1);
                        }}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          selectedTimePeriod === period
                            ? "bg-neutral-700 text-neutral-100"
                            : "text-neutral-300 hover:text-neutral-100"
                        }`}
                      >
                        {period === "1d" ? "24H" : period.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <Tabs
                  defaultValue="accounts"
                  className="max-w-[100vw] w-full h-full mt-0 p-4 border border-neutral-600 border-dashed border-t-0  flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <TabsList className="inline-flex p-0 items-center bg-transparent rounded-md border border-neutral-600">
                      {[
                        { label: "Accounts", value: "accounts" },
                        { label: "Mentions", value: "mentions" },
                      ].map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="px-4 py-2 text-sm font-medium text-neutral-100 hover:text-white rounded-md transition-colors data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100"
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  {/* Accounts Tab - Campaign Leaderboard */}
                  <TabsContent value="accounts" className="space-y-4">
                    {mindshareData?.result?.mindshare_data &&
                      mindshareData.result.mindshare_data.length > 0 && (
                        <CampaignLeaderboard
                          data={mindshareData.result.mindshare_data}
                          totalResults={mindshareData.result.total_results}
                          campaignId={campaignId}
                          selectedTimePeriod={selectedTimePeriod}
                          currentPage={currentPage}
                          followersLimit={followersLimit}
                          onPageChange={handlePageChange}
                        />
                      )}
                  </TabsContent>

                  {/* Mentions Tab - Mentions Feed */}
                  <TabsContent value="mentions" className="space-y-4">
                    <MentionsFeed authorHandle={smartFeedHandle} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Feed Sidebar */}
        {/* <div className="w-[480px] lg:w-[480px] md:w-80 sm:w-72 py-8 pr-8 lg:pr-12 self-stretch sticky top-16 h-[calc(100vh-4rem)]">
          <MentionsFeed authorHandle={smartFeedHandle} />
        </div> */}
      </div>
    </div>
  );
}

// Loading Skeleton Component
function CampaignSkeleton() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <div className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4 bg-gray-700" />
            <Skeleton className="h-4 w-1/2 mb-6 bg-gray-700" />
            <Skeleton className="h-24 w-full bg-gray-700" />
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <div className="p-6">
                <Skeleton className="h-6 w-1/3 mb-4 bg-gray-700" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex justify-between">
                      <Skeleton className="h-4 w-1/3 bg-gray-700" />
                      <Skeleton className="h-4 w-1/3 bg-gray-700" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
