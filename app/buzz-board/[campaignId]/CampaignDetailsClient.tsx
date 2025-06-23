"use client";

import CampaignLeaderboard from "@/app/components/CampaignLeaderboard";
import FollowersOverview from "@/app/components/FollowersOverview";
import MentionsFeed from "@/app/components/MentionsFeed";
import MindshareVisualization from "@/app/components/MindshareVisualization";
import { MindshareResponse, UserProfileResponse } from "@/app/types";
import { XLogo } from "@/components/icons/x-logo";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/lib/api";
import { Campaign } from "@/lib/types";
import { differenceInHours } from "date-fns";
import {
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Instagram,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

function linkifyText(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
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

  const visibleText = isExpanded
    ? description
    : `${description.slice(0, maxLength)}...`;

  return (
    <div className="text-sm text-gray-300 leading-relaxed">
      <div style={{ whiteSpace: "pre-line" }}>{linkifyText(visibleText)}</div>
      {description.length > maxLength && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-[#00D992] hover:text-[#00F5A8] font-medium transition-colors"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      )}
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
    className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-colors group"
    title={label}
  >
    <div className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors">
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

// Helper functions to handle both full URLs and usernames
function getTwitterUrl(handle: string) {
  if (!handle) return null;
  return handle.startsWith("http")
    ? handle
    : `https://twitter.com/${handle.replace("@", "")}`;
}

function getTelegramUrl(username: string) {
  if (!username) return null;
  return username.startsWith("http")
    ? username
    : `https://t.me/${username.replace("@", "")}`;
}

function getDiscordUrl(invite: string) {
  if (!invite) return null;
  return invite.startsWith("http") ? invite : `https://discord.gg/${invite}`;
}

function getInstagramUrl(username: string) {
  if (!username) return null;
  return username.startsWith("http")
    ? username
    : `https://instagram.com/${username.replace("@", "")}`;
}

function getWebsiteUrl(url: string) {
  if (!url) return null;
  return url.startsWith("http") ? url : `https://${url}`;
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
  const pageSize = 100;

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      if (!campaignId) return;

      try {
        setLoading(true);
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
        setLoading(false);
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
        const offset = (currentPage - 1) * pageSize;

        // Fetch paginated data for the leaderboard
        const paginatedResponse = await apiClient.get(
          `/mindshare?project_name=${handle}&limit=${pageSize}&offset=${offset}&period=${period}`
        );
        setMindshareData(paginatedResponse.data);

        // Fetch complete data for visualization only when timeframe changes or on initial load
        if (currentPage === 1) {
          const visualizationResponse = await apiClient.get(
            `/mindshare?project_name=${handle}&limit=100&period=${period}`
          );
          setVisualizationData(visualizationResponse.data);
        }
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
  }, [campaign?.target_x_handle, selectedTimePeriod, currentPage]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading || !campaign) {
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

    const totalHours = differenceInHours(endDate, now);
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (days > 0) {
      return `${days} ${days === 1 ? "day" : "days"} ${hours} ${
        hours === 1 ? "hour" : "hours"
      }`;
    } else {
      return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    }
  };

  // Get the handle for the smart feed (prefer project_handle, then target, fallback to owner)
  const smartFeedHandle = campaign.project_handle
    ? campaign.project_handle.replace("@", "").toLowerCase()
    : campaign.target_x_handle
    ? campaign.target_x_handle.replace("@", "").toLowerCase()
    : campaign.owner_x_handle.replace("@", "").toLowerCase();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex items-start">
        {/* Main Content */}
        <div className="flex-1 py-8 pl-8 lg:pl-12 pr-4">
          <div className="max-w-6xl mx-auto">
            {/* Campaign Header */}
            <Card className="bg-gray-800 border-gray-700 mb-8">
              <div className="p-6">
                <div className="flex flex-col gap-6">
                  {/* Title and Status Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-bold text-gray-100">
                        {campaign.campaign_name}
                      </h1>
                      <StatusBadge status="active" />
                    </div>
                    <div className="flex items-center gap-2">
                      {campaign.project_twitter &&
                        getTwitterUrl(campaign.project_twitter) && (
                          <SocialLink
                            href={getTwitterUrl(campaign.project_twitter)!}
                            icon={<XLogo className="w-5 h-5" />}
                            label="Twitter"
                          />
                        )}
                      {campaign.project_telegram &&
                        getTelegramUrl(campaign.project_telegram) && (
                          <SocialLink
                            href={getTelegramUrl(campaign.project_telegram)!}
                            icon={
                              <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.241-1.865-.44-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.119.098.152.228.166.331.016.119.031.283.02.441z" />
                              </svg>
                            }
                            label="Telegram"
                          />
                        )}
                      {campaign.project_discord &&
                        getDiscordUrl(campaign.project_discord) && (
                          <SocialLink
                            href={getDiscordUrl(campaign.project_discord)!}
                            icon={
                              <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                              </svg>
                            }
                            label="Discord"
                          />
                        )}
                      {campaign.project_insta &&
                        getInstagramUrl(campaign.project_insta) && (
                          <SocialLink
                            href={getInstagramUrl(campaign.project_insta)!}
                            icon={<Instagram className="w-5 h-5" />}
                            label="Instagram"
                          />
                        )}
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap items-center gap-2">
                    {campaign.project_categories?.split(",").map((category) => (
                      <CategoryTag key={category} label={category} />
                    ))}
                  </div>

                  {/* Description */}
                  <div className="max-w-2xl">
                    <ExpandableDescription description={campaign.description} />
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {campaign.project_website &&
                      getWebsiteUrl(campaign.project_website) && (
                        <InfoBadge
                          icon={<Globe className="w-4 h-4" />}
                          label="Website"
                          href={getWebsiteUrl(campaign.project_website)!}
                          detail={
                            new URL(getWebsiteUrl(campaign.project_website)!)
                              .hostname
                          }
                        />
                      )}
                    {(campaign.project_whitepaper ||
                      campaign.project_gitbook) && (
                      <InfoBadge
                        icon={<FileText className="w-4 h-4" />}
                        label="Whitepaper"
                        href={
                          campaign.project_whitepaper ||
                          campaign.project_gitbook
                        }
                        detail="View Documentation"
                      />
                    )}
                    <InfoBadge
                      icon={<Wallet className="w-4 h-4" />}
                      label="Contract Status"
                      status="Pre-TGE"
                      detail="Token Generation Event"
                    />
                    <InfoBadge
                      icon={<Clock className="w-4 h-4" />}
                      label="Campaign Ends"
                      status={getCampaignTimeRemaining()}
                      detail={`Reward: ${campaign.amount} ${campaign.payment_token}`}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Community Mindshare */}
            <div className="mb-8 mt-8">
              <MindshareVisualization
                data={visualizationData?.result?.mindshare_data || []}
                selectedTimePeriod={selectedTimePeriod}
                onTimePeriodChange={(period) => {
                  setSelectedTimePeriod(period as TimePeriod);
                  setCurrentPage(1); // Reset to first page when changing period
                }}
                loading={loading}
                projectName={campaignId}
                projectHandle={campaign?.target_x_handle || ""}
              />
            </div>

            {/* Followers Overview */}
            {campaign?.target_x_handle && (
              <div className="mb-8">
                <FollowersOverview
                  authorHandle={campaign.target_x_handle.replace("@", "")}
                />
              </div>
            )}

            {/* Leaderboard */}
            {mindshareData?.result?.mindshare_data &&
              mindshareData.result.mindshare_data.length > 0 && (
                <div className="mb-8">
                  <CampaignLeaderboard
                    data={mindshareData.result.mindshare_data}
                    totalResults={mindshareData.result.total_results}
                    campaignId={campaignId}
                    selectedTimePeriod={selectedTimePeriod}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
          </div>
        </div>

        {/* Smart Feed Sidebar */}
        <div className="w-[480px] lg:w-[480px] md:w-80 sm:w-72 py-8 pr-8 lg:pr-12 self-start sticky top-8">
          <MentionsFeed authorHandle={smartFeedHandle} />
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton Component
function CampaignSkeleton() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-900">
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
