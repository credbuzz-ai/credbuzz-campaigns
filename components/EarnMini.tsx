import { ReferralTable } from "@/app/components/ReferralTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/lib/types";
import { Check, Copy, ExternalLink, Gem, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ReferralCard } from "./ReferralCard";
import TooltipInfo from "./TooltipInfo";

export default function EarnMini() {
  const { user, refreshUser } = useUser();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [referralCount, setReferralCount] = useState(
    user?.total_referrals || 0
  );
  const [isCopied, setIsCopied] = useState(false);

  const referralUrl = user?.referral_code
    ? `https://trendsage.xyz?referral_code=${user.referral_code}`
    : "";

  const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
    `Join me on @0xtrendsage and earn 10 SAGE with my referral link!\n\n${referralUrl}`
  )}`;

  const claimXFollow = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      // Make the request with authorization header
      const response = await fetch("/api/user/claim-x-follow", {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to claim X follow");
      }

      // Update tasks to mark X follow as completed
      const updatedTasks = tasks.map((task) => {
        if (task.id === 1) {
          return { ...task, completed: task.total };
        }
        return task;
      });
      setTasks(updatedTasks);
      await refreshUser();

      toast({
        title: "X follow claimed successfully",
        description: "50 SAGE have been added to your account",
      });
    } catch (error: any) {
      toast({
        title: "Failed to claim X follow",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  };

  const shareOnTelegram = () => {
    const shareUrl = `https://trendsage.xyz?referral_code=${user?.referral_code}`;
    const shareText = `TrendSage is doing great by helping you turn your Web3 Influence into $$$$.\n\nJoin me on @0xtrendsage and earn 10 SAGE upon joining with my referral URL:\n\n${shareUrl}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
    toast({
      title: "Telegram share opened!",
    });
  };

  useEffect(() => {
    const initialTasks = [
      {
        id: 1,
        title: "Follow on X",
        description: "Follow @0xtrendsage on X",
        total: 1,
        completed: user?.x_follow_claimed ? 1 : 0,
        points: 50,
        action: claimXFollow,
        link: "https://x.com/intent/follow?screen_name=0xtrendsage",
      },
      {
        id: 2,
        title: "Invite 5 friends",
        description: "And earn added 100 SAGE.",
        total: 5,
        completed: Math.min(user?.total_referrals ?? 0, 5),
        points: 100,
        link: tweetUrl,
      },
    ];

    setTasks(initialTasks);
    setReferralCount(user?.total_referrals || 0);
  }, [user]);

  useEffect(() => {
    const progress = (referralCount / 5) * 100;

    if (referralCount >= 5) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === 2 && task.completed < task.total) {
          return { ...task, completed: task.total };
        }
        return task;
      });
      setTasks(updatedTasks);
    }
  }, [referralCount, tasks]);

  const handleTaskAction = async (task: Task) => {
    if (task.link) {
      window.open(task.link, "_blank");
    }
    if (task.action) {
      await task.action();
    }
  };

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  const copyReferralCode = () => {
    const shareText = `TrendSage is doing great by helping you turn your Web3 Influence into $$$$.\n\nJoin me on @0xtrendsage and earn 10 SAGE upon joining with my referral URL:\n\n${referralUrl}`;
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const shareOnX = () => {
    if (!referralUrl) return;
    const text = encodeURIComponent(
      `TrendSage is doing great by helping you turn your Web3 Influence into $$$$.\n\nJoin me on @0xtrendsage and earn 10 SAGE upon joining with my referral URL:\n\n${referralUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <Card className="bg-transparent border-none col-span-1 lg:col-span-7">
          <div className="rounded-lg p-3 sm:p-4 bg-gradient-to-br from-[#0F3F2E] to-[#044d39]/60 border border-[#155748]/40 shadow-inner">
            <p className="text-sm text-[#66E2C1] mb-1 font-medium tracking-wide">
              Total SAGE earned
            </p>
            <p className="text-xl sm:text-2xl font-semibold text-[#DFFCF6]">
              {formatNumber(user?.total_points ?? 0)}
            </p>
          </div>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-[#DFFCF6] text-base font-medium flex items-center gap-2">
              Tasks for SAGE
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 space-y-4">
            {tasks.map((task) => {
              const progressPercent = (task.completed / task.total) * 100;
              const isCompleted = task.completed >= task.total;
              return (
                <div
                  key={task.id}
                  className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl space-y-3 sm:space-y-0 p-3 sm:p-4 border ${
                    isCompleted
                      ? "bg-[#1E2A28]/30 border-[#1E2A28]"
                      : "bg-[#1E2A28]/10 border-[#1E2A28]/50 hover:bg-[#1E2A28]/20"
                  } transition-colors duration-200`}
                >
                  {/* Left cluster */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
                    {/* number badge */}
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full text-xs font-semibold ${
                          isCompleted
                            ? "bg-[#00D992]/20 text-[#00D992]"
                            : "bg-[#1E2A28] text-[#DFFCF6]"
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : task.id}
                      </span>
                      {task.total > 1 && (
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {task.completed}/{task.total}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={`text-sm font-medium leading-4 ${
                            isCompleted ? "text-gray-400" : "text-gray-100"
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-1 text-gray-100 text-xs font-medium px-2 py-0.5 rounded-full bg-[#1E2A28]/50">
                          +{task.points}
                          <Gem className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 leading-4 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                      {task.total > 1 && (
                        <div className="w-full mt-2">
                          <Progress
                            value={progressPercent}
                            className={`h-1.5 ${
                              isCompleted ? "bg-gray-700/50" : "bg-gray-700"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right cluster */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 w-full sm:w-auto justify-end">
                    {isCompleted ? (
                      <Button
                        size="sm"
                        disabled
                        variant="secondary"
                        className="bg-[#00D992]/10 text-[#00D992] border-[#00D992]/20 hover:bg-[#00D992]/20"
                      >
                        Completed <Check className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-gray-700 text-gray-300 hover:bg-[#00D992] hover:text-[#060F11] w-full sm:w-auto justify-center"
                        onClick={() => handleTaskAction(task)}
                      >
                        Start Task <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-xl border-none bg-transparent col-span-1 lg:col-span-5">
          <CardHeader className="py-0 px-3 sm:px-6">
            <CardTitle className="text-neutral-100 text-base sm:text-lg">
              <TooltipInfo
                text="Your friends earn 10 SAGE each when they join using your referral link. You will also earn 10 SAGE when they follow @0xtrendsage on X."
                className="mr-2"
              />
              Share Your Referral Link to earn SAGE
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-3 sm:px-6">
            <ReferralCard referralCode={user?.referral_code || ""} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Button
                onClick={copyReferralCode}
                className="w-full bg-gray-700/30 hover:bg-gray-600/30 text-gray-100 border border-gray-600/30 h-9 flex items-center justify-center gap-1 rounded-xl text-sm"
                size="sm"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </Button>
              <Button
                onClick={shareOnX}
                className="w-full bg-gray-700/30 hover:bg-gray-600/30 text-gray-100 border border-gray-600/30 h-9 flex items-center justify-center gap-1 rounded-xl text-sm"
                size="sm"
              >
                <span>Share on X</span>
              </Button>

              <Button
                onClick={shareOnTelegram}
                className="w-full bg-gray-700/30 hover:bg-gray-600/30 text-gray-100 border border-gray-600/30 h-9 flex items-center justify-center gap-1 rounded-xl text-sm"
                size="sm"
              >
                <Share2 className="h-4 w-4" />
                <span>Telegram</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referral Stats Card */}
        <Card className="col-span-1 lg:col-span-12 border-neutral-600 bg-neutral-900">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-[#DFFCF6] text-base font-medium flex items-center gap-2">
              Your Referrals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            {user?.referrals && (
              <ReferralTable
                referrals={user.referrals}
                partialReferrals={user.partial_referrals || []}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
