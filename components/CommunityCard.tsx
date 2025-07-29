import { Campaign } from "@/lib/types";
import { ExternalLink, TrendingUp, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CommunityCard({ campaign }: { campaign: Campaign }) {
  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Link href={`/communities/${campaign.campaign_id}`}>
      <div className="group relative max-w-sm min-w-[320px] min-h-[320px] bg-cardBackground hover:bg-cardBackground2 p-6 rounded-xl border-2 border-gray-700/30 h-full transition-all duration-300 hover:border-[#00D992]/50 hover:shadow-[0_8px_32px_rgba(0,217,146,0.15)]">
        {/* Community Badge */}
        <div className="absolute -top-3 left-4 bg-gradient-to-r from-[#00D992] to-[#00F5A8] text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
          Community
        </div>

        {/* Header Section */}
        <div className="flex items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={
                  campaign.owner_info?.profile_image_url ?? "/logo-green.svg"
                }
                alt={campaign.campaign_name}
                width={48}
                height={48}
                className="rounded-xl ring-2 ring-gray-700/30 group-hover:ring-[#00D992]/30 transition-all duration-300"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00D992] rounded-full border-2 border-cardBackground flex items-center justify-center">
                <Users className="w-2 h-2 text-gray-900" />
              </div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-gray-100 group-hover:text-[#00D992] transition-colors">
                {campaign.campaign_name}
              </h3>
              <p className="text-sm text-gray-400">
                by @{campaign.owner_x_handle}
              </p>
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-800/20 rounded-lg border border-gray-700/30">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00D992]" />
            <div>
              <p className="text-xs text-gray-400">Members</p>
              <p className="text-sm font-semibold text-gray-100">
                {formatFollowers(campaign.owner_info?.followers_count || 0)}
              </p>
            </div>
          </div>
          {campaign.target_token_symbol && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00D992]" />
              <div>
                <p className="text-xs text-gray-400">Token</p>
                <p className="text-sm font-semibold text-gray-100">
                  ${campaign.target_token_symbol}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            {campaign.description.length > 120
              ? `${campaign.description.slice(0, 120)}...`
              : campaign.description}
            {campaign.description.length > 120 && (
              <Link
                href={`/communities/${campaign.campaign_id}`}
                className="inline-flex items-center gap-1 text-[#00D992] hover:text-[#00F5A8] text-sm font-medium transition-colors mt-2"
              >
                Read more <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
