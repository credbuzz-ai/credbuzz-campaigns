"use client";

import { MindshareResponse } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { usePrivyDatabaseSync } from "@/hooks/usePrivyDatabaseSync";
import apiClient from "@/lib/api";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Send,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CampaignLeaderboardProps {
  data: MindshareResponse["result"]["mindshare_data"];
  totalResults: number;
  campaignId: string;
  selectedTimePeriod?: "30d" | "7d" | "1d";
  onPageChange?: (page: number) => void;
  currentPage?: number;
  pageSize?: number;
}

export default function CampaignLeaderboard({
  data,
  totalResults,
  selectedTimePeriod = "30d",
  onPageChange,
  currentPage = 1,
  pageSize = 100,
}: CampaignLeaderboardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const totalPages = Math.ceil(totalResults / pageSize);
  const { ready, authenticated, user, isProcessing, login } =
    usePrivyDatabaseSync();

  const handleInvite = async (authorHandle: string) => {
    try {
      if (!ready) {
        return;
      }

      if (!authenticated) {
        login();
        return;
      }

      // Check if user exists
      const response = await apiClient.get(
        `/user/user-exists?x_handle=${authorHandle}`
      );

      if (response.data.result === true) {
        toast({
          description: "This user is already a member of our platform!",
          duration: 1000,
        });
        return;
      }

      // If user doesn't exist, proceed with invite
      const referralCode = user?.referral_code || "";
      const referralUrl = `https://trendsage.xyz/?referral_code=${referralCode}`;
      const tweetText = `🚀 Hey @${authorHandle}! Join me on @0xtrendsage - the premier platform for Web3 content creators.\n\nUse my referral url to get 10 SAGE on signup!\n\n${referralUrl}\n\n#Web3 #ContentCreators`;
      const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
        tweetText
      )}`;
      window.open(tweetUrl, "_blank");
    } catch (error) {
      console.error("Error checking user existence:", error);
      toast({
        title: "Error",
        description:
          "There was an error processing your invite. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && onPageChange) {
      onPageChange(newPage);
    }
  };

  return (
    <Card className="bg-neutral-900 border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-100">
              Community Leaderboard
            </h3>
            <p className="text-sm text-gray-400">
              Top contributors in the last{" "}
              {selectedTimePeriod === "1d" ? "24 hours" : selectedTimePeriod}
            </p>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300 w-[40%]">Name</TableHead>
                <TableHead className="text-gray-300 text-center">
                  Invite to Earn
                </TableHead>
                <TableHead className="text-gray-300">
                  {selectedTimePeriod} Mindshare
                </TableHead>
                <TableHead className="text-gray-300 text-center">
                  Smart Followers
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((contributor, index) => (
                <TableRow
                  key={contributor.author_handle}
                  className="border-gray-700 hover:bg-gray-700/30 transition-colors"
                >
                  <TableCell className="font-medium w-[40%]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00D992]/10 text-[#00D992] text-sm font-semibold">
                            {contributor.current_rank}
                          </div>
                          {contributor.current_rank !==
                            contributor.previous_rank && (
                            <div className="flex items-center mt-1">
                              {contributor.current_rank <
                              contributor.previous_rank ? (
                                <div className="flex items-center text-green-500 text-xs">
                                  <TrendingUp className="w-3 h-3 mr-0.5" />
                                  {contributor.previous_rank -
                                    contributor.current_rank}
                                </div>
                              ) : (
                                <div className="flex items-center text-red-500 text-xs">
                                  <TrendingDown className="w-3 h-3 mr-0.5" />
                                  {contributor.current_rank -
                                    contributor.previous_rank}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {contributor.user_info.profile_image_url ? (
                          <Image
                            src={contributor.user_info.profile_image_url}
                            alt={contributor.user_info.name}
                            width={32}
                            height={32}
                            className="rounded-full bg-gray-800 object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-600">
                            👤
                          </div>
                        )}
                        <div>
                          <div
                            className="font-medium text-gray-100 hover:text-[#00D992] cursor-pointer transition-colors"
                            onClick={() =>
                              router.push(`/kols/${contributor.author_handle}`)
                            }
                          >
                            {contributor.user_info.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            @{contributor.author_handle}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {isProcessing ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300">
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        Connecting...
                      </span>
                    ) : contributor.user_info.user_joined ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#00D992]/10 text-[#00D992]">
                        Joined
                      </span>
                    ) : (
                      <span
                        onClick={() => handleInvite(contributor.author_handle)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#00D992]/10 text-[#00D992] cursor-pointer hover:bg-[#00D992]/20 transition-colors"
                      >
                        Invite for 10 SAGE <Send className="w-3.5 h-3.5 ml-1" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="font-medium text-[#00D992]">
                      {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(contributor.mindshare_percent)}
                      %
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="font-medium text-gray-100">
                      {new Intl.NumberFormat("en-US", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(contributor.user_info.smart_followers_count)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-gray-400">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalResults)} of{" "}
                {totalResults} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-[#00D992]/10 hover:text-white hover:border-[#00D992]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-[#00D992]/10 hover:text-white hover:border-[#00D992]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
