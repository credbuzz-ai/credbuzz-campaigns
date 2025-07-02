import { Campaign } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

function formatAmount(amount: number): string {
  const formatDecimal = (value: number) => {
    const fixed = value.toFixed(4);
    return fixed.replace(/\.?0+$/, ""); // Remove trailing zeros and decimal point if no decimals
  };

  if (amount >= 1000000000) return formatDecimal(amount / 1000000000) + "B";
  if (amount >= 1000000) return formatDecimal(amount / 1000000) + "M";
  if (amount >= 1000) return formatDecimal(amount / 1000) + "K";
  return formatDecimal(amount);
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

function getTimeRemaining(endDateString: string): string {
  const now = new Date();
  const endDate = new Date(endDateString);
  const diffInMs = endDate.getTime() - now.getTime();

  if (diffInMs <= 0) {
    return "Ended";
  }

  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hr${hours !== 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} min${minutes !== 1 ? "s" : ""}`);

  return parts.join(" ");
}

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Link href={`/sage-campaigns/${campaign.campaign_id}`}>
      <div className="max-w-sm bg-cardBackground hover:bg-cardBackground2 p-6 rounded-xl border-2 border-gray-700/30 h-full transition-all duration-200 hover:border-[#00D992]/30">
        <div className="flex flex-col justify-between items-start mb-4 border-b border-gray-700/30">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Image
                src={"/logo-green.svg"}
                alt={campaign.campaign_name}
                width={24}
                height={24}
              />
              <span className="text-xl font-semibold text-gray-100 group-hover:text-[#00D992] transition-colors">
                {campaign.campaign_name?.trim()}
              </span>
              <span className="text-gray-400 text-sm font-medium">
                ${campaign.target_token_symbol?.trim()}
              </span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
                campaign.status
              )}`}
            >
              {getStatusDisplayName(campaign.status)}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm my-6">
            <span className="text-gray-400 text-left">
              {campaign.description.slice(0, 100)}...{" "}
              <Link
                href={`/sage-campaigns/${campaign.campaign_id}`}
                className="text-[#00D992] hover:text-[#00F5A8] font-medium transition-colors"
              >
                Read more
              </Link>
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex flex-col gap-2">
            <span className="text-gray-400">Rewards Pool</span>
            <span className="text-lg">
              {formatAmount(campaign.amount)} {campaign.payment_token}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-gray-400">Campaign Ends in</span>
            <span className="text-lg">
              {getTimeRemaining(campaign.offer_end_date)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
