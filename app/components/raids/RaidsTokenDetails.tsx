import { XLogo } from "@/components/icons/x-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import type { HandleDetails, TokenDetails } from "./RaidsInterfaces";
import { formatNumber, getPriceChangeColor } from "./RaidsUtils";

interface RaidsTokenDetailsProps {
  tokenDetails: TokenDetails | null;
  handleDetails: HandleDetails | null;
  onTokenIdCopy: (tokenId: string) => void;
}

export function RaidsTokenDetails({
  tokenDetails,
  handleDetails,
  onTokenIdCopy,
}: RaidsTokenDetailsProps) {
  if (!tokenDetails && !handleDetails) return null;

  return (
    <div className="bg-neutral-800 border border-neutral-600 rounded-none p-4 mb-2">
      <div className="flex items-start gap-3">
        <img
          src={
            tokenDetails?.profile_image_url ||
            handleDetails?.profile_image_url ||
            "/placeholder.svg"
          }
          alt={tokenDetails?.symbol || handleDetails?.author_handle}
          className="w-16 h-16 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">
                ${tokenDetails?.symbol || handleDetails?.author_handle}
              </h1>
              {tokenDetails?.token_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTokenIdCopy(tokenDetails.token_id)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-[#00D992] hover:bg-[#00D992]/10"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              )}
              <span className="text-gray-300 text-sm">
                {tokenDetails?.name}
              </span>
              {(tokenDetails?.twitter_final ||
                handleDetails?.author_handle) && (
                <button
                  onClick={() => {
                    const twitterHandle =
                      tokenDetails?.twitter_final ||
                      handleDetails?.author_handle;
                    if (twitterHandle) {
                      window.open(
                        `https://x.com/search?q=${encodeURIComponent(
                          twitterHandle
                        )}&src=typed_query&f=live`,
                        "_blank"
                      );
                    }
                  }}
                  className="text-gray-400 text-sm hover:text-[#00D992] transition-colors"
                >
                  (@
                  {tokenDetails?.twitter_final || handleDetails?.author_handle})
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs bg-neutral-700 border-neutral-500"
              >
                {tokenDetails?.chain || "N/A"}
              </Badge>
              {/* Twitter Profile Link */}
              {(tokenDetails?.twitter_final ||
                handleDetails?.author_handle) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const twitterHandle =
                      tokenDetails?.twitter_final ||
                      handleDetails?.author_handle;
                    if (twitterHandle) {
                      window.open(
                        `https://x.com/search?q=${encodeURIComponent(
                          twitterHandle
                        )}&src=typed_query&f=live`,
                        "_blank"
                      );
                    }
                  }}
                  className="border-neutral-600 text-gray-300 hover:border-[#00D992] hover:text-[#000000] p-1 h-7 px-3"
                >
                  <XLogo className="w-3 h-3" />
                  <span className="text-xs">Twitter</span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Mentions (24h)</span>
                <p className="font-medium">
                  {formatNumber(tokenDetails?.mention_count_24hr || 0)}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Market Cap</span>
                <p className="font-medium">
                  {formatNumber(tokenDetails?.marketcap || 0)}
                </p>
              </div>
              <div>
                <span className="text-gray-400">24h Change</span>
                <p
                  className={`font-medium ${getPriceChangeColor(
                    (tokenDetails?.pc_24_hr ?? 0) > 0 ? 1 : -1
                  )}`}
                >
                  {(tokenDetails?.pc_24_hr ?? 0).toFixed(1)}%
                </p>
              </div>
              <div>
                <span className="text-gray-400">Volume (24h)</span>
                <p className="font-medium">
                  {formatNumber(tokenDetails?.volume_24hr || 0)}
                </p>
              </div>
            </div>
            {tokenDetails?.narrative && (
              <div className="flex flex-col gap-1">
                {tokenDetails.narrative
                  .split(", ")
                  .map((tag: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-neutral-700 border-neutral-500 text-gray-300"
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
