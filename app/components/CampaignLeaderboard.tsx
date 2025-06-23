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
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
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
  campaignId,
  selectedTimePeriod = "30d",
  onPageChange,
  currentPage = 1,
  pageSize = 100,
}: CampaignLeaderboardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const totalPages = Math.ceil(totalResults / pageSize);

  const handleInvite = (authorHandle: string) => {
    // TODO: Implement invite functionality
    console.log(`Inviting ${authorHandle}`);
    toast({
      title: "Invite Feature Coming Soon",
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && onPageChange) {
      onPageChange(newPage);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
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
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300 text-right">
                  {selectedTimePeriod} Mindshare
                </TableHead>
                <TableHead className="text-gray-300 text-right">
                  Smart Followers
                </TableHead>
                <TableHead className="text-gray-300 text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((contributor, index) => (
                <TableRow
                  key={contributor.author_handle}
                  className="border-gray-700 hover:bg-gray-700/30 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00D992]/10 text-[#00D992] text-sm font-semibold">
                        {(currentPage - 1) * pageSize + index + 1}
                      </div>
                      <div className="flex items-center gap-2">
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
                  <TableCell className="text-right">
                    <div className="font-medium text-[#00D992]">
                      {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(contributor.mindshare_percent)}
                      %
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium text-gray-100">
                      {new Intl.NumberFormat("en-US", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(contributor.user_info.smart_followers_count)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer border border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-[#00D992]/10 hover:text-white hover:border-[#00D992] transition-all"
                      onClick={() => handleInvite(contributor.author_handle)}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Invite
                    </Button>
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
