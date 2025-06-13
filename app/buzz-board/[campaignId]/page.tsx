"use client";

import { XLogo } from "@/components/icons/x-logo";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/lib/api";
import { Campaign } from "@/lib/types";
import { truncateAddress } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Clock, Coins, Wallet } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CampaignDetailsPage() {
  const params = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.post("/campaign/get-campaigns", {
          campaign_id: params.campaignId,
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
  }, [params.campaignId]);

  useEffect(() => {
    const fetchMindshare = async () => {
      try {
        // TODO: remove later
        const response = await apiClient.get(`/mindshare?project_name=infinex`);
        // const response = await apiClient.get(
        //   `/mindshare?project_name=${campaign?.target_x_handle?.replace(
        //     "@",
        //     ""
        //   )}`
        // );
        console.log("Mindshare data:", response.data);
      } catch (err) {
        console.error("Error fetching mindshare:", err);
      }
    };

    if (campaign?.target_x_handle) {
      fetchMindshare();
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

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Campaign Header */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-100">
                  {campaign.campaign_name}
                </h1>
                <div className="flex items-center gap-2 text-gray-400">
                  <XLogo className="w-4 h-4" />
                  <span>Creator: @{campaign.project_x_handle}</span>
                </div>
                {campaign.target_x_handle && (
                  <div className="flex items-center gap-2 text-gray-400 mt-2">
                    <XLogo className="w-4 h-4" />
                    <span className="text-[#00D992]">
                      Target: {campaign.target_x_handle}
                    </span>
                  </div>
                )}
                <p className="text-gray-300 text-lg max-w-2xl">
                  {campaign.description}
                </p>
              </div>
              <div>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    campaign.status === "OPEN"
                      ? "bg-[#00D992]/10 text-[#00D992] border border-[#00D992]/20"
                      : campaign.status === "PUBLISHED"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : campaign.status === "ACCEPTED"
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      : campaign.status === "FULFILLED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                  }`}
                >
                  {campaign.status}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Campaign Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Token Details */}
          <Card className="bg-gray-800 border-gray-700 hover:border-[#00D992]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#00D992]/10">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-[#00D992]/10">
                  <Coins className="w-5 h-5 text-[#00D992]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-100">
                  Token Details
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Token</span>
                  <span className="font-medium text-gray-100">
                    {campaign.token}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-medium text-gray-100">
                    {campaign.amount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Chain</span>
                  <span className="font-medium text-gray-100">
                    {campaign.chain}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Campaign Timeline */}
          <Card className="bg-gray-800 border-gray-700 hover:border-[#00D992]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#00D992]/10">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-[#00D992]/10">
                  <Clock className="w-5 h-5 text-[#00D992]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-100">
                  Timeline
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Offer Ends</span>
                  <span className="font-medium text-gray-100">
                    {formatDistanceToNow(new Date(campaign.offer_end_date), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Type</span>
                  <span className="font-medium text-gray-100">
                    {campaign.campaign_type}
                  </span>
                </div>
                {campaign.counter && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Counter</span>
                    <span className="font-medium text-gray-100">
                      {campaign.counter}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Wallet Information */}
          <Card className="bg-gray-800 border-gray-700 hover:border-[#00D992]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#00D992]/10">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-[#00D992]/10">
                  <Wallet className="w-5 h-5 text-[#00D992]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-100">
                  Wallet Information
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-400 block mb-1">
                    Project Wallet
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-100 break-all bg-gray-700/50 p-2 rounded block flex-1">
                      {truncateAddress(campaign.project_wallet)}
                    </span>
                    <CopyButton text={campaign.project_wallet} />
                  </div>
                </div>
                {campaign.influencer_wallet && (
                  <div>
                    <span className="text-gray-400 block mb-1">
                      Influencer Wallet
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-gray-100 break-all bg-gray-700/50 p-2 rounded block flex-1">
                        {truncateAddress(campaign.influencer_wallet)}
                      </span>
                      <CopyButton text={campaign.influencer_wallet} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
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
