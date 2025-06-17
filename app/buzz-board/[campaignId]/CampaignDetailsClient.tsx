"use client";

import FollowersOverview from "@/app/components/FollowersOverview";
import MindshareVisualization from "@/app/components/MindshareVisualization";
import SmartFeed from "@/app/components/SmartFeed";
import { MindshareResponse, UserProfileResponse } from "@/app/types";
import { XLogo } from "@/components/icons/x-logo";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/lib/api";
import { Campaign } from "@/lib/types";
import { differenceInHours } from "date-fns";
import { Clock, Coins } from "lucide-react";
import { useEffect, useState } from "react";

// Expandable Description component for campaign descriptions
const ExpandableDescription = ({ description }: { description: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150; // Maximum characters to show initially

  if (description.length <= maxLength) {
    return <p className="text-sm text-gray-300 leading-relaxed">{description}</p>;
  }

  return (
    <div className="text-sm text-gray-300 leading-relaxed">
      {isExpanded ? description : `${description.slice(0, maxLength)}...`}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-1 text-[#00D992] hover:text-[#00F5A8] font-medium transition-colors"
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

export default function CampaignDetailsClient({ campaignId }: CampaignDetailsClientProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mindshareData, setMindshareData] = useState<MindshareResponse | null>(
    null
  );
  const [selectedTimePeriod, setSelectedTimePeriod] =
    useState<TimePeriod>("30d");
  const [activityData, setActivityData] = useState<
    UserProfileResponse["result"]["activity_data"] | null
  >(null);

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
        setError("Failed to load campaign details");
        console.error("Error fetching campaign:", err);
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
        const response = await apiClient.get(
          `/mindshare?project_name=${handle}&limit=100&period=${period}`
        );
        setMindshareData(response.data);
      } catch (err) {
        console.error(`Error fetching mindshare for ${period}:`, err);
        setMindshareData(null);
      } finally {
        setLoading(false);
      }
    };

    if (campaign?.target_x_handle) {
      fetchMindshare(selectedTimePeriod);
    }
  }, [campaign?.target_x_handle, selectedTimePeriod]);

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

  if (loading) {
    return <CampaignSkeleton />;
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-400">{error || "Campaign not found"}</p>
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
      return `${days} ${days === 1 ? 'day' : 'days'} ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
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
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-gray-100">
                        {campaign.campaign_name}
                      </h1>
                      <button
                        onClick={() => window.open('https://twitter.com', '_blank')}
                        className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-colors group"
                        title="View on Twitter"
                      >
                        <XLogo className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                      </button>
                    </div>
                    <div className="max-w-2xl">
                      <ExpandableDescription description={campaign.description} />
                    </div>
                  </div>
                  <div className="text-right space-y-3">
                    <div className="flex items-center gap-2 text-[#00D992] font-semibold text-sm">
                      <Coins className="w-4 h-4" />
                      <span>Reward: {campaign.amount} {campaign.payment_token}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#00D992] font-semibold text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Ends: {getCampaignTimeRemaining()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Community Mindshare */}
            <div className="mb-8 mt-8">
              <MindshareVisualization 
                data={mindshareData?.result?.mindshare_data || []}
                selectedTimePeriod={selectedTimePeriod}
                onTimePeriodChange={(period) => setSelectedTimePeriod(period as TimePeriod)}
                loading={loading}
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
          </div>
        </div>

        {/* Smart Feed Sidebar */}
        <div className="w-[480px] lg:w-[480px] md:w-80 sm:w-72 py-8 pr-8 lg:pr-12 self-start sticky top-8">
          <SmartFeed authorHandle={smartFeedHandle} />
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