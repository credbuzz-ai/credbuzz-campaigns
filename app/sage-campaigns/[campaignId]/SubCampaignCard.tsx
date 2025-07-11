import { Card } from "@/components/ui/card";
import { Campaign } from "@/lib/types";
import { BrowserIcon } from "@/public/icons/BrowserIcon";
import { DiscordIcon } from "@/public/icons/DiscordIcon";
import { TgIcon } from "@/public/icons/TgIcon";
import { XIcon } from "@/public/icons/XIcon";
import Image from "next/image";

// Helper function to format amounts
function formatAmount(amount: number): string {
  const formatDecimal = (value: number) => {
    const fixed = value.toFixed(4);
    return fixed.replace(/\.?0+$/, "");
  };

  if (amount >= 1_000_000_000)
    return formatDecimal(amount / 1_000_000_000) + "B";
  if (amount >= 1_000_000) return formatDecimal(amount / 1_000_000) + "M";
  if (amount >= 1_000) return formatDecimal(amount / 1_000) + "K";
  return formatDecimal(amount);
}

// Helper function to calculate sub-campaign time remaining
const getSubCampaignTimeRemaining = (endDate: string) => {
  const end = new Date(endDate);
  const now = new Date();

  if (end <= now) {
    return "Ended";
  }

  const diffInMs = end.getTime() - now.getTime();
  const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
  const hours = Math.floor(
    (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);

  const parts = [];

  if (days >= 30) {
    parts.push(`${months} ${months === 1 ? "month" : "months"}`);
    const remainingDays = days % 30;
    if (remainingDays > 0) {
      parts.push(`${remainingDays} ${remainingDays === 1 ? "day" : "days"}`);
    }
  } else if (hours >= 1) {
    if (days > 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    if (minutes > 0)
      parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  } else {
    if (minutes > 0)
      parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
    parts.push(`${seconds} ${seconds === 1 ? "second" : "seconds"}`);
  }

  return parts.join(" ");
};

// Helper to format time remaining string with different styles for numbers and labels
const formatTimeRemainingDisplay = (timeStr: string) => {
  const tokens = timeStr.split(/\s+/);
  return tokens.map((token, idx) => {
    const isNumber = /^\d+$/.test(token);
    const className = isNumber
      ? "text-neutral-100 text-[20px] font-semibold"
      : "text-neutral-300 text-sm";
    return (
      <span key={idx} className={className}>
        {token}
        &nbsp;{!isNumber && " "}
      </span>
    );
  });
};

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
    className="rounded-full"
    title={label}
  >
    <div className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors">
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
    <Card
      className={`max-w-[400px] bg-neutral-900/50 backdrop-blur-sm border transition-all duration-300 rounded-2xl overflow-hidden group cursor-pointer
        ${
          isSelected
            ? "border-[#00D992] shadow-[0_0_15px_-3px_rgba(0,217,146,0.3)]"
            : "border-neutral-700/50 hover:border-[#00D992]/20"
        }`}
      onClick={() => onSelect(subCampaign.campaign_id)}
    >
      <div className="p-6">
        <div className="flex flex-col gap-4">
          {/* Header with Image and Title */}
          <div className="flex items-start gap-4">
            <div className="shrink-0 relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#00D992]/20 to-neutral-700/20 rounded-xl blur-sm group-hover:blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Image
                src={ownerProfileImage || "/placeholder-logo.png"}
                alt={subCampaign.campaign_name}
                width={48}
                height={48}
                className="rounded-xl object-cover relative ring-1 ring-neutral-700/50 group-hover:ring-[#00D992]/20 transition duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              {/* Campaign Name - Full Width */}
              <h3 className="text-lg font-semibold text-neutral-100 group-hover:text-[#00D992] transition-colors mb-2">
                {subCampaign.campaign_name}
              </h3>

              {/* Time Remaining - Prominent Display */}
              <div className="mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
                  <div className="w-2 h-2 bg-[#00D992] rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-neutral-200">
                    {formatTimeRemainingDisplay(
                      getSubCampaignTimeRemaining(subCampaign.offer_end_date)
                    )}
                  </span>
                </div>
              </div>

              {/* Token Symbol and Campaign Type */}
              <div className="flex items-center gap-2 mb-3">
                {subCampaign.target_token_symbol && (
                  <span className="text-sm font-medium text-[#00D992] bg-[#00D992]/10 px-2 py-1 rounded-md">
                    ${subCampaign.target_token_symbol}
                  </span>
                )}
                <span className="text-xs font-medium px-2 py-1 rounded-md bg-neutral-800/50 text-neutral-300 border border-neutral-700/50">
                  {subCampaign.campaign_type}
                </span>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {(subCampaign.project_handle ||
                  subCampaign.target_x_handle ||
                  subCampaign.owner_x_handle) && (
                  <SocialLink
                    href={`https://x.com/${(
                      subCampaign.project_handle ||
                      subCampaign.target_x_handle ||
                      subCampaign.owner_x_handle
                    )?.replace("@", "")}`}
                    icon={<XIcon />}
                    label="Twitter"
                  />
                )}
                {subCampaign.project_telegram && (
                  <SocialLink
                    href={subCampaign.project_telegram}
                    icon={<TgIcon />}
                    label="Telegram"
                  />
                )}
                {subCampaign.project_discord && (
                  <SocialLink
                    href={subCampaign.project_discord}
                    icon={<DiscordIcon />}
                    label="Discord"
                  />
                )}
                {subCampaign.project_website && (
                  <SocialLink
                    href={subCampaign.project_website}
                    icon={<BrowserIcon />}
                    label="Website"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Reward Pool - More Prominent */}
          <div className="bg-[#00D992]/5 rounded-xl p-4 border border-[#00D992]/10">
            <span className="text-sm text-[#00D992] font-medium block mb-1">
              Reward pool
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-[#00D992]">
                {formatAmount(subCampaign.amount)}
              </span>
              <span className="text-sm text-[#00D992]/80">
                {subCampaign.payment_token}
              </span>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {subCampaign.project_categories?.split(",").map((category) => (
              <CategoryTag key={category} label={category} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SubCampaignCard;
