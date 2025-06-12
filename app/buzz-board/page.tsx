"use client";

import CollaborateDialog from "@/components/CollaborateDialog";
import apiClient from "@/lib/api";
import { Campaign } from "@/lib/types";
import { Clock, DollarSign, Search, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const categories = ["All", "Public", "Targeted"];

// Dynamic status options based on campaign type
const getStatusOptions = (selectedCategory: string) => {
  if (selectedCategory === "Public") {
    return ["All", "Published", "Fulfilled", "Discarded"];
  } else if (selectedCategory === "Targeted") {
    return ["All", "Open", "Active", "Fulfilled", "Unfulfilled", "Discarded"];
  } else {
    // When "All" categories are selected, show all possible statuses
    return [
      "All",
      "Open",
      "Published",
      "Active",
      "Fulfilled",
      "Unfulfilled",
      "Discarded",
    ];
  }
};

export default function BuzzBoard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Reset status filter when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedStatus("All"); // Reset status to "All" when category changes
  };

  // Get current status options based on selected category
  const currentStatusOptions = getStatusOptions(selectedCategory);

  // Function to format large numbers
  const formatAmount = (amount: number): string => {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
    }
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return amount.toString();
  };

  const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
    const matchesSearch =
      campaign.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.project_x_handle
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || campaign.campaign_type === selectedCategory;
    const matchesStatus =
      selectedStatus === "All" ||
      campaign.status === selectedStatus.toUpperCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Helper function to get demo values for missing properties
  const calculateTimeProgress = (campaign: Campaign) => {
    if (campaign.status === "FULFILLED") {
      return 100;
    }

    if (campaign.status === "OPEN") {
      return 0;
    }

    try {
      const endDate = new Date(campaign.offer_end_date);
      const currentDate = new Date();

      // If end date has passed, return 100%
      if (currentDate >= endDate) {
        return 100;
      }

      // Calculate campaign duration (assuming it started 30 days before end date as demo)
      // You might want to add a start_date field to your Campaign type for more accuracy
      const estimatedStartDate = new Date(endDate);
      estimatedStartDate.setDate(estimatedStartDate.getDate() - 30); // Assume 30-day campaigns

      // If current date is before estimated start, return 0%
      if (currentDate < estimatedStartDate) {
        return 0;
      }

      const totalDuration = endDate.getTime() - estimatedStartDate.getTime();
      const elapsed = currentDate.getTime() - estimatedStartDate.getTime();

      const progress = Math.round((elapsed / totalDuration) * 100);
      return Math.max(0, Math.min(100, progress)); // Ensure between 0-100
    } catch (error) {
      console.error("Error calculating time progress:", error);
      // Fallback to demo progress if date parsing fails
      return campaign.status === "PUBLISHED" || campaign.status === "ACCEPTED"
        ? 50
        : 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-[#00D992]/20 text-[#00D992] border-[#00D992]/30";
      case "PUBLISHED":
        return "bg-blue-900/50 text-blue-300 border-blue-700";
      case "ACCEPTED":
      case "ACTIVE":
        return "bg-green-900/50 text-green-300 border-green-700";
      case "FULFILLED":
        return "bg-gray-700/50 text-gray-300 border-gray-600";
      case "UNFULFILLED":
        return "bg-red-900/50 text-red-300 border-red-700";
      case "DISCARDED":
        return "bg-gray-700/50 text-gray-400 border-gray-600";
      default:
        return "bg-gray-700/50 text-gray-300 border-gray-600";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Public":
        return "bg-[#00D992]/10 border-[#00D992]/30 hover:border-[#00D992]/50";
      case "Targeted":
        return "bg-purple-900/20 border-purple-700/50 hover:border-purple-600";
      default:
        return "bg-gray-800 border-gray-700 hover:border-[#00D992]/30";
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Open";
      case "PUBLISHED":
        return "Published";
      case "ACCEPTED":
      case "ACTIVE":
        return "Active";
      case "FULFILLED":
        return "Fulfilled";
      case "UNFULFILLED":
        return "Unfulfilled";
      case "DISCARDED":
        return "Discarded";
      default:
        return status;
    }
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      const campaigns = await apiClient.post("/campaign/get-campaigns", {
        campaign_type: "Public",
      });
      setCampaigns(campaigns.data.result);
      console.log(campaigns.data.result);
    };
    fetchCampaigns();
  }, []);

  // Update the stats calculation
  const activeCount = campaigns.filter(
    (c) => c.status === "PUBLISHED" || c.status === "ACCEPTED"
  ).length;
  const recruitingCount = campaigns.filter((c) => c.status === "OPEN").length;

  // Calculate total budget from actual campaign data
  const totalBudget = campaigns.reduce((sum, campaign) => {
    return sum + (campaign.amount || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-100 mb-4">
                Buzz Board
              </h1>
              <p className="text-xl text-gray-300">
                Discover and join active Web3 marketing campaigns
              </p>
            </div>
            <CollaborateDialog mode="public">
              <button className="px-6 py-3 bg-[#00D992] hover:bg-[#00F5A8] text-gray-900 font-semibold rounded-xl transition-colors flex items-center gap-2">
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
        <div className="card-trendsage mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search campaigns or brands..."
                className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-xl 
             bg-gray-700 text-gray-100 placeholder-gray-400
             focus-trendsage transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="px-4 py-3 border border-gray-600 rounded-xl 
             bg-gray-700 text-gray-100
             focus-trendsage"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Status Filter - Dynamic based on category */}
            <select
              className="px-4 py-3 border border-gray-600 rounded-xl 
             bg-gray-700 text-gray-100
             focus-trendsage"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {currentStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-trendsage text-center group">
            <TrendingUp className="w-8 h-8 text-[#00D992] mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-gray-100">
              {activeCount}
            </div>
            <div className="text-sm text-gray-400">Active Campaigns</div>
          </div>
          <div className="card-trendsage text-center group">
            <Users className="w-8 h-8 text-[#00D992] mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-gray-100">
              {campaigns.length}
            </div>
            <div className="text-sm text-gray-400">Total Campaigns</div>
          </div>
          <div className="card-trendsage text-center group">
            <DollarSign className="w-8 h-8 text-[#00D992] mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-gray-100">
              {totalBudget > 0 ? formatAmount(totalBudget) : "0"}
            </div>
            <div className="text-sm text-gray-400">Total Budget</div>
          </div>
          <div className="card-trendsage text-center group">
            <Clock className="w-8 h-8 text-[#00D992] mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-gray-100">
              {recruitingCount}
            </div>
            <div className="text-sm text-gray-400">Recruiting</div>
          </div>
        </div>

        {/* Campaign Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => {
            const progress = calculateTimeProgress(campaign);
            return (
              <Link
                key={campaign.campaign_id}
                href={`/buzz-board/${campaign.campaign_id}`}
                className="group hover:scale-[1.02] transition-transform"
              >
                <div
                  className={`${getCategoryColor(
                    campaign.campaign_type
                  )} p-6 rounded-xl border h-full transition-all duration-200`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-100 mb-1 group-hover:text-[#00D992] transition-colors">
                        {campaign.campaign_name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        @{campaign.project_x_handle}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        campaign.status
                      )}`}
                    >
                      {getStatusDisplayName(campaign.status)}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {campaign.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Budget:</span>
                      <span className="text-gray-200 font-medium">
                        {formatAmount(campaign.amount)} {campaign.token}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Token:</span>
                      <span className="text-gray-200">{campaign.token}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Chain:</span>
                      <span className="text-gray-200">{campaign.chain}</span>
                    </div>

                    {campaign.status !== "OPEN" && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-sm">
                            Time Progress
                          </span>
                          <span className="text-gray-200 text-sm">
                            {campaign.status === "FULFILLED"
                              ? "100%"
                              : `${progress}%`}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              campaign.status === "FULFILLED"
                                ? "bg-gradient-to-r from-gray-500 to-gray-600"
                                : "bg-gradient-to-r from-[#00D992] to-[#00F5A8]"
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        {campaign.status === "FULFILLED" && (
                          <div className="text-xs text-red-400 mt-1">
                            Campaign has ended
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No campaigns found</div>
            <div className="text-gray-500 text-sm">
              Try adjusting your search or filter criteria
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
