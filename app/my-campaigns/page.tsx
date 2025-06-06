"use client";

import { usePrivy } from "@privy-io/react-auth";
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Pause,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";

// Mock data for campaigns
const mockCreatedCampaigns = [
  {
    id: "camp_001",
    name: "DeFi Token Launch",
    description: "Promote our new DeFi token to crypto enthusiasts",
    status: "active",
    budget: 5000,
    spent: 2500,
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    engagement: 15420,
    reach: 45000,
    campaign_type: "Public" as const,
    participants: 12,
    chain: "Solana",
  },
  {
    id: "camp_002",
    name: "NFT Collection Drop",
    description: "Marketing campaign for exclusive NFT collection",
    status: "completed",
    budget: 3000,
    spent: 2800,
    startDate: "2023-12-01",
    endDate: "2024-01-01",
    engagement: 8750,
    reach: 25000,
    campaign_type: "Targeted" as const,
    participants: 8,
    chain: "Base",
  },
  {
    id: "camp_003",
    name: "Gaming Platform Beta",
    description: "Promote beta launch of Web3 gaming platform",
    status: "paused",
    budget: 7500,
    spent: 1200,
    startDate: "2024-01-20",
    endDate: "2024-03-20",
    engagement: 3200,
    reach: 12000,
    campaign_type: "Public" as const,
    participants: 4,
    chain: "Solana",
  },
];

const mockReceivedCampaigns = [
  {
    id: "recv_001",
    name: "Crypto Wallet Review",
    description: "Review and promote new crypto wallet features",
    status: "active",
    amount: 500,
    startDate: "2024-01-10",
    endDate: "2024-02-10",
    engagement: 2800,
    reach: 8500,
    campaign_type: "Targeted" as const,
    brand_name: "CryptoWallet Pro",
    chain: "Base",
  },
  {
    id: "recv_002",
    name: "DeFi Protocol Partnership",
    description: "Collaborative content about yield farming strategies",
    status: "completed",
    amount: 750,
    startDate: "2023-11-15",
    endDate: "2023-12-15",
    engagement: 5200,
    reach: 15000,
    campaign_type: "Public" as const,
    brand_name: "YieldMax Protocol",
    chain: "Solana",
  },
  {
    id: "recv_003",
    name: "Trading Bot Showcase",
    description: "Demonstrate trading bot capabilities and results",
    status: "pending",
    amount: 1200,
    startDate: "2024-02-01",
    endDate: "2024-03-01",
    engagement: 0,
    reach: 0,
    campaign_type: "Targeted" as const,
    brand_name: "AutoTrade AI",
    chain: "Base",
  },
];

export default function MyCampaigns() {
  const { ready, authenticated, user } = usePrivy();
  const [activeTab, setActiveTab] = useState<"created" | "received">("created");

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "paused":
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "paused":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "pending":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default:
        return "bg-red-500/10 text-red-400 border-red-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "created"
                  ? "border-[#00D992] text-[#00D992]"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              Created Campaigns ({mockCreatedCampaigns.length})
            </button>
            <button
              onClick={() => setActiveTab("received")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "received"
                  ? "border-[#00D992] text-[#00D992]"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              Received Campaigns ({mockReceivedCampaigns.length})
            </button>
          </nav>
        </div>

        {/* Created Campaigns Tab */}
        {activeTab === "created" && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockCreatedCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-[#00D992]/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100 mb-1">
                        {campaign.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          campaign.status
                        )}`}
                      >
                        {getStatusIcon(campaign.status)}
                        {campaign.status.charAt(0).toUpperCase() +
                          campaign.status.slice(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                      {campaign.campaign_type}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {campaign.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Budget
                      </span>
                      <span className="text-gray-100 font-medium">
                        ${campaign.budget.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Spent</span>
                      <span className="text-gray-100 font-medium">
                        ${campaign.spent.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-[#00D992] h-2 rounded-full transition-all"
                        style={{
                          width: `${(campaign.spent / campaign.budget) * 100}%`,
                        }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
                          <Eye className="w-3 h-3" />
                          Reach
                        </div>
                        <div className="text-gray-100 font-medium text-sm">
                          {campaign.reach.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
                          <Users className="w-3 h-3" />
                          Participants
                        </div>
                        <div className="text-gray-100 font-medium text-sm">
                          {campaign.participants}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(
                          campaign.startDate
                        ).toLocaleDateString()} -{" "}
                        {new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                        {campaign.chain}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Received Campaigns Tab */}
        {activeTab === "received" && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockReceivedCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-[#00D992]/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100 mb-1">
                        {campaign.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          campaign.status
                        )}`}
                      >
                        {getStatusIcon(campaign.status)}
                        {campaign.status.charAt(0).toUpperCase() +
                          campaign.status.slice(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                      {campaign.campaign_type}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-[#00D992] font-medium mb-1">
                      From: {campaign.brand_name}
                    </p>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {campaign.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Offer Amount
                      </span>
                      <span className="text-gray-100 font-medium">
                        ${campaign.amount.toLocaleString()}
                      </span>
                    </div>

                    {campaign.status !== "pending" && (
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
                            <Eye className="w-3 h-3" />
                            Reach
                          </div>
                          <div className="text-gray-100 font-medium text-sm">
                            {campaign.reach.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
                            <TrendingUp className="w-3 h-3" />
                            Engagement
                          </div>
                          <div className="text-gray-100 font-medium text-sm">
                            {campaign.engagement.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(
                          campaign.startDate
                        ).toLocaleDateString()} -{" "}
                        {new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                        {campaign.chain}
                      </span>
                    </div>
                  </div>

                  {campaign.status === "pending" && (
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 bg-[#00D992] text-gray-900 py-2 px-3 rounded-lg text-sm font-medium hover:bg-[#00D992]/90 transition-colors">
                        Accept
                      </button>
                      <button className="flex-1 bg-gray-700 text-gray-300 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors">
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
