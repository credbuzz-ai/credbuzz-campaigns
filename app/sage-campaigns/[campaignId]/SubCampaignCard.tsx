import { Campaign } from "@/lib/types";
import Image from "next/image";

// Helper function to format amounts
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
  switch (status.toLowerCase()) {
    case "ongoing":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "completed":
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    case "upcoming":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

function getTimeRemaining(endDateString: string): string {
  const now = new Date();
  const endDate = new Date(endDateString);
  const diffInMs = endDate.getTime() - now.getTime();

  if (diffInMs <= 0) {
    return "Ended";
  }

  const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
  const hours = Math.floor(
    (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);

  const parts = [];

  if (days >= 30) {
    // If more than 30 days, show months and remaining days
    parts.push(`${months} month${months !== 1 ? "s" : ""}`);
    const remainingDays = days % 30;
    if (remainingDays > 0) {
      parts.push(`${remainingDays} day${remainingDays !== 1 ? "s" : ""}`);
    }
  } else if (hours >= 1) {
    // If less than 30 days but more than 1 hour
    if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hr${hours !== 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} min${minutes !== 1 ? "s" : ""}`);
  } else {
    // If less than 1 hour, show minutes and seconds
    if (minutes > 0) parts.push(`${minutes} min${minutes !== 1 ? "s" : ""}`);
    parts.push(`${seconds} sec${seconds !== 1 ? "s" : ""}`);
  }

  return parts.join(" ");
}

interface SubCampaignCardProps {
  subCampaign: Campaign;
  isSelected: boolean;
  onSelect: (id: string) => void;
  ownerProfileImage?: string;
}

export const SubCampaignCard = ({
  subCampaign,
  isSelected,
  onSelect,
  ownerProfileImage,
}: SubCampaignCardProps) => {
  return (
    <div
      className={`max-w-sm bg-cardBackground hover:bg-cardBackground2 p-6 rounded-md border-2 h-full transition-all duration-200 cursor-pointer
        ${
          isSelected
            ? "border-[#00D992] shadow-[0_0_15px_-3px_rgba(0,217,146,0.3)]"
            : "border-gray-700/30 hover:border-[#00D992]/30"
        }`}
      onClick={() => onSelect(subCampaign.campaign_id)}
    >
      <div className="flex flex-col justify-between items-start mb-4 border-b border-gray-700/30">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Image
              src={ownerProfileImage || "/logo-green.svg"}
              alt={subCampaign.campaign_name}
              width={32}
              height={32}
            />
            <div className="flex flex-col items-start gap-1 ml-2">
              <span className="text-xl font-semibold text-gray-100 group-hover:text-[#00D992] transition-colors">
                {subCampaign.campaign_name}
              </span>
              <span className="text-gray-400 text-sm font-medium">
                ${subCampaign.target_token_symbol}
              </span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
              subCampaign.status || "ongoing"
            )}`}
          >
            {subCampaign.status || "ongoing"}
          </span>
        </div>

        {/* Description section */}
        <div className="flex items-center justify-center gap-2 text-sm my-6">
          <span className="text-gray-400 text-left">
            {subCampaign.description?.slice(0, 100) ||
              "No description available"}
            ...
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <div className="flex flex-col gap-2">
          <span className="text-gray-400">Rewards Pool</span>
          <span className="text-lg">
            {formatAmount(subCampaign.amount)} {subCampaign.payment_token}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-gray-400">
            {(subCampaign.status || "ongoing").toLowerCase() === "ongoing"
              ? "Ends in"
              : (subCampaign.status || "ongoing").toLowerCase() === "upcoming"
              ? "Starts in"
              : "Campaign has"}
          </span>
          <span className="text-lg">
            {getTimeRemaining(subCampaign.offer_end_date)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SubCampaignCard;
