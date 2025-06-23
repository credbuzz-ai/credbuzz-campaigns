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
import { Send } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CampaignLeaderboardProps {
  data: MindshareResponse["result"]["mindshare_data"];
  campaignId: string;
  selectedTimePeriod?: "30d" | "7d" | "1d";
}

export default function CampaignLeaderboard({
  data,
  campaignId,
  selectedTimePeriod = "30d",
}: CampaignLeaderboardProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Sort data by mindshare percentage and get top 10
  const topContributors = [...data]
    .sort((a, b) => b.mindshare_percent - a.mindshare_percent)
    .slice(0, 10);

  const handleInvite = (authorHandle: string) => {
    // TODO: Implement invite functionality
    console.log(`Inviting ${authorHandle}`);
    toast({
      title: "Invite Feature Coming Soon",
    });
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
              {topContributors.map((contributor, index) => (
                <TableRow
                  key={contributor.author_handle}
                  className="border-gray-700 hover:bg-gray-700/30 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00D992]/10 text-[#00D992] text-sm font-semibold">
                        {index + 1}
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
                      {contributor.mindshare_percent.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      Buzz Score: {contributor.author_buzz.toFixed(1)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium text-gray-100">
                      {contributor.user_info.smart_followers_count.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      Engagement:{" "}
                      {contributor.user_info.engagement_score.toFixed(1)}
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
        </div>
      </div>
    </Card>
  );
}
