import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/lib/types";
import { Check, ExternalLink, Gem, Share2 } from "lucide-react";
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
        description: "100 Buzz Points have been added to your account",
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
        points: 10,
        action: claimXFollow,
        link: "https://x.com/0xtrendsage",
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

  const copyReferral = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    toast({ title: "Referral link copied!" });
  };

  const shareOnX = () => {
    if (!referralUrl) return;
    const text = encodeURIComponent(
      `Join me on @0xtrendsage and earn 10 SAGE with my referral link! ${referralUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="bg-transparent border-none col-span-7">
          <div className="rounded-lg p-4 bg-gradient-to-br from-[#0F3F2E] to-[#044d39]/60 border border-[#155748]/40 shadow-inner">
            <p className="text-sm text-[#66E2C1] mb-1 font-medium tracking-wide">
              Total SAGE earned
            </p>
            <p className="text-2xl font-semibold text-[#DFFCF6]">
              {formatNumber(user?.total_points ?? 0)}
            </p>
          </div>
          <CardHeader className="p-4">
            <CardTitle className="text-[#DFFCF6] text-base font-medium">
              Tasks for SAGE
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-5">
            {tasks.map((task) => {
              const progressPercent = (task.completed / task.total) * 100;
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-3 px-0 rounded-lg"
                >
                  {/* Left cluster */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/* number badge */}
                    <span className="h-6 w-6 flex items-center justify-center rounded-[4px] bg-[#1E2A28] text-[10px] font-semibold text-[#DFFCF6]">
                      {task.id}
                    </span>
                    <div className="w-48">
                      <p className="text-sm font-medium text-gray-100 leading-4">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400 leading-4 mt-1">
                        {task.description}
                      </p>
                    </div>
                    {task.total > 1 && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400">
                          {task.completed}/{task.total}
                        </span>
                        <div className="w-24">
                          <Progress
                            value={progressPercent}
                            className="h-1 bg-gray-700"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right cluster */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-1 text-gray-100 text-sm font-medium">
                      +{task.points}
                      <Gem className="w-3 h-3 text-gray-400" />
                    </div>
                    {task.completed >= task.total ? (
                      <Button
                        size="sm"
                        disabled
                        variant="secondary"
                        className="bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"
                      >
                        Done <Check className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-gray-700 text-gray-300 hover:bg-[#00D992] hover:text-[#060F11]"
                        onClick={() => handleTaskAction(task)}
                      >
                        Finish task <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className=" shadow-xl border-none bg-transparent col-span-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-100">
              Share Your Referral Link
            </CardTitle>
            <p className="text-sm text-gray-400 flex items-center">
              <TooltipInfo
                text="Your friends earn 10 SAGE each when they join using your referral link. You will also earn 10 SAGE when they follow @0xtrendsage on X."
                className="mr-2"
              />
              Refer and Earn 10 SAGE each time someone uses your referral link.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <ReferralCard referralCode={user?.referral_code || ""} />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button
                onClick={shareOnX}
                className="bg-gray-700/30 hover:bg-gray-600/30 text-gray-100 border border-gray-600/30 h-9 flex items-center justify-center gap-2 rounded-xl"
                size="sm"
              >
                <span>Share on X</span>
              </Button>

              <Button
                onClick={shareOnTelegram}
                className="bg-gray-700/30 hover:bg-gray-600/30 text-gray-100 border border-gray-600/30 h-9 flex items-center justify-center gap-2 rounded-xl"
                size="sm"
              >
                <Share2 className="h-4 w-4" />
                <span>Telegram</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
