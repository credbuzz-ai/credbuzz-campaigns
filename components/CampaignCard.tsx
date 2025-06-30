import { Campaign } from "@/lib/types";
import Link from "next/link";

function formatAmount(amount: number): string {
  if (amount >= 1000000000) return (amount / 1000000000).toFixed(4) + "B";
  if (amount >= 1000000) return (amount / 1000000).toFixed(4) + "M";
  if (amount >= 1000) return (amount / 1000).toFixed(4) + "K";
  return amount.toFixed(4);
}

function getStatusColor(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "bg-[#00D992]/10 text-[#00D992] border-[#00D992]/20";
    case "FULFILLED":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "DISCARDED":
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

function getStatusDisplayName(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "Published";
    case "FULFILLED":
      return "Fulfilled";
    case "DISCARDED":
      return "Discarded";
    default:
      return status;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Link
      href={`/buzz-board/${campaign.campaign_id}`}
      className="group hover:scale-[1.02] transition-transform"
    >
      <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/30 h-full transition-all duration-200 hover:border-[#00D992]/30">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-100 mb-1 group-hover:text-[#00D992] transition-colors">
              {campaign.campaign_name}
            </h3>
            <p className="text-gray-400 text-sm">@{campaign.owner_x_handle}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
              campaign.status
            )}`}
          >
            {getStatusDisplayName(campaign.status)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="text-gray-300 text-sm mb-4">
            {campaign.description.slice(0, 100)}...
            <Link
              href={`/buzz-board/${campaign.campaign_id}`}
              className="ml-1 text-[#00D992] hover:text-[#00F5A8] font-medium transition-colors"
            >
              Read more
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Budget</span>
            <span className="text-gray-200 font-medium">
              {formatAmount(campaign.amount)} {campaign.payment_token}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Token</span>
            <span className="text-gray-200">{campaign.payment_token}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Chain</span>
            <span className="text-gray-200">{campaign.chain}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-400">Status</span>
            <span className="text-gray-200">
              {getStatusDisplayName(campaign.status)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
            <span>Ends: {formatDate(campaign.offer_end_date)}</span>
            {campaign.status === "FULFILLED" && (
              <span className="text-red-400">Campaign has ended</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
