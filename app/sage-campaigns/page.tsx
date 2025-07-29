"use client";

import CampaignCard from "@/components/CampaignCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiClient from "@/lib/api";
import { Campaign } from "@/lib/types";
import { useEffect, useState } from "react";

const statusOptions = ["All", "Ongoing", "Completed", "Upcoming"];

const CampaignCardSkeleton = () => (
  <div className="max-w-sm bg-cardBackground p-6 rounded-md border-2 border-gray-700/30 h-full">
    <div className="flex flex-col justify-between items-start mb-4 border-b border-gray-700/30">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center justify-center gap-2 text-sm my-6">
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
    <div className="flex justify-between items-center text-sm">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  </div>
);

export default function BuzzBoard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Ongoing");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
    const matchesSearch =
      campaign.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.owner_x_handle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" ||
      campaign.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    const campaigns = await apiClient.post("/campaign/get-campaigns", {
      campaign_type: "Public",
      is_visible: true,
    });
    // Sort campaigns by offer_end_date in descending order (latest first)
    const sortedCampaigns = campaigns.data.result.sort(
      (a: Campaign, b: Campaign) => {
        return (
          new Date(b.offer_end_date).getTime() -
          new Date(a.offer_end_date).getTime()
        );
      }
    );
    setCampaigns(sortedCampaigns);
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="min-h-screen relative py-8 px-4 sm:px-6 lg:px-8 mt-16 md:mt-0">
      <div className="pointer-events-none select-none absolute inset-0 -z-10 bg-[url('/landingPageBg.png')] bg-cover bg-center opacity-40" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-0 md:mb-8">
          <div className="flex flex-col gap-8 md:flex-row justify-between items-start mb-0 md:mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-100 mb-4">
                Explore Campaigns
              </h1>
              <p className="text-xl text-gray-300">
                Discover and join active Web3 marketing campaigns
              </p>
            </div>

            {/* Filters */}
            <div className="mb-4 md:mb-8">
              <Tabs
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                className="w-full"
              >
                <TabsList className="bg-neutral-900 border border-neutral-600 p-0 h-auto flex flex-wrap">
                  {statusOptions.map((status) => (
                    <TabsTrigger
                      key={status}
                      value={status}
                      className="data-[state=active]:bg-neutral-700 hover:bg-neutral-700 px-2 py-1.5 md:px-3 md:py-2 rounded-none text-sm md:text-base"
                    >
                      {status}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* <CollaborateDialog mode="public">
              <button
                className="btn-primarynew inline-flex items-center justify-center min-w-[160px]"
                title="Create a new public campaign"
              >
                <span>Create Campaign</span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </CollaborateDialog> */}
          </div>
        </div>
        {/* Campaign Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <CampaignCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map(
              (campaign) =>
                campaign.is_visible && (
                  <CampaignCard
                    key={campaign.campaign_id}
                    campaign={campaign}
                  />
                )
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2 flex items-center justify-center gap-2">
              <svg
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="text-emerald-500"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01"
                />
              </svg>
              Let's Find Your Perfect Campaign!
            </div>
            <div className="text-gray-400 text-lg mb-4">
              {searchTerm ? (
                <>
                  We couldn't find any matches for "{searchTerm}"
                  {selectedStatus !== "All" &&
                    ` in ${selectedStatus.toLowerCase()} campaigns`}
                  <br />
                  <span className="text-emerald-400 font-medium">
                    Try different keywords or explore all campaigns to discover
                    exciting opportunities!
                  </span>
                </>
              ) : selectedStatus !== "All" ? (
                <>
                  Stay tuned! {selectedStatus} campaigns are coming soon.
                  <br />
                  <span className="text-emerald-400 font-medium">
                    Meanwhile, check out other amazing campaigns in different
                    stages! 🚀
                  </span>
                </>
              ) : (
                <>
                  Get ready for something amazing!
                  <br />
                  <span className="text-emerald-400 font-medium">
                    New campaigns are launching soon. Be the first to join when
                    they arrive! ✨
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
