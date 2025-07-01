"use client";

import CampaignCard from "@/components/CampaignCard";
import CollaborateDialog from "@/components/CollaborateDialog";
import apiClient from "@/lib/api";
import { Campaign } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

// const statusOptions = ["All", "Published", "Fulfilled", "Discarded"];

export default function BuzzBoard() {
  // const [searchTerm, setSearchTerm] = useState("");
  // const [selectedStatus, setSelectedStatus] = useState("All");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  // const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
  // const matchesSearch =
  //   campaign.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   campaign.owner_x_handle.toLowerCase().includes(searchTerm.toLowerCase());
  // const matchesStatus =
  //   selectedStatus === "All" ||
  //   campaign.status === selectedStatus.toUpperCase();
  // return matchesSearch && matchesStatus;
  // return matchesStatus;
  // });

  const fetchCampaigns = async () => {
    setLoading(true);
    const campaigns = await apiClient.post("/campaign/get-campaigns", {
      campaign_type: "Public",
      is_visible: true,
    });
    setCampaigns(campaigns.data.result);
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-100 mb-4">
                Public Campaigns
              </h1>
              <p className="text-xl text-gray-300">
                Discover and join active Web3 marketing campaigns
              </p>
            </div>
            <CollaborateDialog mode="public">
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
            </CollaborateDialog>
          </div>
        </div>
        {/* Filters */}
        {/* <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search campaigns or brands..."
                className="w-full pl-10 pr-4 py-3 border border-gray-600/30 rounded-xl 
             bg-gray-700/30 text-gray-100 placeholder-gray-400
             focus-trendsage transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 min-w-[180px]">
              <select
                className="px-4 py-3 border border-gray-600/30 rounded-xl 
             bg-gray-700/30 text-gray-100 min-w-[150px]
             focus-trendsage"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div> */}
        {/* Campaign Card Guide */}
        <div className="mb-6 p-3 bg-cardBackground rounded-xl border border-gray-700/30 text-xs text-gray-400 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <span className="font-semibold text-gray-300">Rewards:</span> Total
            rewards for influencers
          </div>
          <div>
            <span className="font-semibold text-gray-300">Token:</span> Currency
            used for rewards
          </div>
          <div>
            <span className="font-semibold text-gray-300">Chain:</span>{" "}
            Blockchain for distribution
          </div>
        </div>
        {/* Campaign Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" />
              Loading campaigns...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(
              (campaign) =>
                campaign.is_visible && (
                  <CampaignCard
                    key={campaign.campaign_id}
                    campaign={campaign}
                  />
                )
            )}
          </div>
        )}

        {campaigns && campaigns.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2 flex items-center justify-center gap-2">
              <svg
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="text-[#00D992]"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01"
                />
              </svg>
              No campaigns found
            </div>
            <div className="text-gray-500 text-sm mb-2">
              Try adjusting your search or filter criteria.
              <br />
              <span className="text-gray-400">
                Tip: Public campaigns are created by brands or projects looking
                for influencer collaboration. Use the{" "}
                <span className="text-[#00D992] font-medium">
                  Create Campaign
                </span>{" "}
                button above to start your own!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
