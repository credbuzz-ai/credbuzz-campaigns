"use client";

import { ReferralCard } from "@/components/ReferralCard";
import TooltipInfo from "@/components/TooltipInfo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import { usePrivy } from "@privy-io/react-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Award, Check, Copy, Download, Share, Share2 } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Task {
  id: number;
  title: string;
  description: string;
  points: number;
  icon: React.ReactNode;
  completed: boolean;
  link?: string;
  action?: () => void;
}

interface LeaderboardUser {
  author_handle: string;
  name: string;
  score: number;
  followers: number;
  smart_followers: number;
  avg_views: number;
  profile_image_url: string;
}

interface LeaderboardResponse {
  result: {
    data: LeaderboardUser[];
    total: number;
    start: number;
    limit: number;
  };
  message: string;
}

const formatNumber = (num: number, maxDecimals: number = 1): string => {
  const formatDecimal = (value: number) => {
    const fixed = value.toFixed(maxDecimals);
    return fixed.replace(/\.?0+$/, ""); // Remove trailing zeros and decimal point if no decimals
  };

  if (num >= 1000000) {
    return formatDecimal(num / 1000000) + "M";
  }
  if (num >= 1000) {
    return formatDecimal(num / 1000) + "K";
  }
  return formatDecimal(num);
};

const EarnPage = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const { login, ready } = usePrivy();

  const referralCode = user?.referral_code || "0xSAGE";
  const referralUrl = `https://trendsage.xyz?referral_code=${referralCode}`;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState(user ? 1 : 0);
  const [referralCount, setReferralCount] = useState(
    user?.total_referrals || 0
  );
  const [referralProgress, setReferralProgress] = useState(
    (referralCount / 5) * 100
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [isCopied, setIsCopied] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [totalLeaderboardItems, setTotalLeaderboardItems] = useState(0);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [isSocialCardCopying, setIsSocialCardCopying] = useState(false);
  const [isSocialCardDownloading, setIsSocialCardDownloading] = useState(false);

  const fetchLeaderboard = async (page: number) => {
    setIsLeaderboardLoading(true);
    setLeaderboardError(null);
    try {
      const start = (page - 1) * itemsPerPage;
      const response = await fetch(
        "https://api.cred.buzz/user/get-score-leaderboard",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start,
            limit: itemsPerPage,
            author_handle: user?.x_handle || "",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data: LeaderboardResponse = await response.json();
      setLeaderboardData(data.result.data);
      setTotalLeaderboardItems(data.result.total);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      setLeaderboardError(
        error instanceof Error
          ? error.message
          : "Failed to fetch leaderboard data"
      );
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch leaderboard data",
        variant: "destructive",
      });
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(currentPage);
  }, [currentPage, user?.x_handle]);

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

      const data = await response.json();

      // Update tasks to mark X follow as completed
      const updatedTasks = tasks.map((task) => {
        if (task.id === 2) {
          return { ...task, completed: true };
        }
        return task;
      });
      setTasks(updatedTasks);
      setCompletedTasks((prev) => prev + 1);

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

  useEffect(() => {
    const initialTasks = [
      {
        id: 2,
        title: "X Follow",
        description: "Follow @0xtrendsage on X",
        points: 50,
        icon: <Award className="h-5 w-5 text-blue-400" />,
        completed: user?.x_follow_claimed || false,
        link: "https://x.com/0xtrendsage",
        action: claimXFollow,
      },
      {
        id: 3,
        title: "Refer 5 Friends",
        description: "Get 5 friends to sign up using your referral code",
        points: 100,
        icon: <Share className="h-5 w-5 text-yellow-500" />,
        completed: (user?.total_referrals || 0) >= 5 ? true : false,
      },
    ];

    setTasks(initialTasks);
    setReferralCount(user?.total_referrals || 0);
    setCompletedTasks(initialTasks.filter((task) => task.completed).length);
  }, [user]);

  useEffect(() => {
    const progress = (referralCount / 5) * 100;
    setReferralProgress(progress);

    if (referralCount >= 5) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === 3 && !task.completed) {
          setCompletedTasks((prev) => prev + 1);
          return { ...task, completed: true };
        }
        return task;
      });
      setTasks(updatedTasks);
    }
  }, [referralCount, tasks]);

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralUrl);
    setIsCopied(true);
    toast({
      title: "Referral link copied to clipboard!",
    });

    // Reset after 2 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const shareOnX = () => {
    const shareUrl = `https://trendsage.xyz?referral_code=${referralCode}`;
    const shareText = `TrendSage is doing great by helping you turn your Web3 Influence into $$$$.\n\nJoin me on @0xtrendsage and earn 10 SAGE upon joining with my referral URL:\n\n${shareUrl}`;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}`;
    window.open(url, "_blank");
    toast({
      title: "X share opened!",
    });
  };

  const shareOnTelegram = () => {
    const shareUrl = `https://trendsage.xyz?referral_code=${referralCode}`;
    const shareText = `TrendSage is doing great by helping you turn your Web3 Influence into $$$$.\n\nJoin me on @0xtrendsage and earn 10 SAGE upon joining with my referral URL:\n\n${shareUrl}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
    toast({
      title: "Telegram share opened!",
    });
  };

  const completeTask = (taskId: number) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId && !task.completed) {
        toast({
          title: `Task completed! +${task.points} SAGE`,
        });
        setCompletedTasks((prev) => prev + 1);
        return { ...task, completed: true };
      }
      return task;
    });

    setTasks(updatedTasks);
  };

  const handleConnectX = async () => {
    if (ready) {
      login();
    }
  };

  const totalPages = Math.ceil(totalLeaderboardItems / itemsPerPage);
  const showPagination = totalLeaderboardItems > itemsPerPage;

  const copySocialCard = async () => {
    if (!user) return;

    try {
      setIsSocialCardCopying(true);
      
      // Generate social card using server-side API
      const params = new URLSearchParams({
        name: user.name || "TrendSage",
        handle: user.x_handle || "0xtrendsage", 
        followers: (user.followers || 0).toString(),
        rewards: (user.total_points || 0).toString(),
        profileImage: user.profile_image_url || "",
      });
      
      const response = await fetch(`/api/social-card?${params}`);
      if (!response.ok) throw new Error("Failed to generate social card");
      
      const blob = await response.blob();

      // Create the promotional text
      const socialText = `🚀 Join me on @0xtrendsage, where Web3 influence meets rewards! \n\n📊 Check out my stats and achievements on TrendSage.\n\n🎁 Use my referral link to get 10 SAGE when you join and follow @0xtrendsage\n${referralUrl}\n\nLet's build our Web3 credibility together! 🌟`;

      try {
        // Create a ClipboardItem with both text and image
        const clipboardContent = [
          new ClipboardItem({
            "text/plain": new Blob([socialText], { type: "text/plain" }),
            "image/png": blob,
          }),
        ];

        await navigator.clipboard.write(clipboardContent);
        toast({
          title: "Social card copied!",
          description:
            "Image and text copied to clipboard. You can now paste them anywhere",
        });
      } catch (err) {
        // Fallback: Try to copy text and image separately
        try {
          await navigator.clipboard.writeText(socialText);
          const data = new ClipboardItem({
            "image/png": blob,
          });
          await navigator.clipboard.write([data]);
          toast({
            title: "Social card copied!",
            description:
              "Image and text copied to clipboard. You can now paste them anywhere",
          });
        } catch (fallbackErr) {
          throw fallbackErr;
        }
      }
    } catch (error) {
      console.error("Error copying social card:", error);
      toast({
        title: "Failed to copy social card",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSocialCardCopying(false);
    }
  };

  const downloadSocialCard = async () => {
    if (!user) return;

    try {
      setIsSocialCardDownloading(true);
      
      // Generate social card using server-side API
      const params = new URLSearchParams({
        name: user.name || "TrendSage",
        handle: user.x_handle || "0xtrendsage",
        followers: (user.followers || 0).toString(),
        rewards: (user.total_points || 0).toString(),
        profileImage: user.profile_image_url || "",
      });
      
      const response = await fetch(`/api/social-card?${params}`);
      if (!response.ok) throw new Error("Failed to generate social card");
      
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `trendsage-social-card-${user?.x_handle || "user"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Social card downloaded!",
        description: "Check your downloads folder",
      });
    } catch (error) {
      console.error("Error downloading social card:", error);
      toast({
        title: "Failed to download social card",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSocialCardDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900/30 py-4 sm:py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 px-2 sm:px-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-2 sm:mb-4">
            Earn SAGE
          </h1>
          <p className="text-lg sm:text-xl text-gray-300">
            Complete tasks and earn rewards for your engagement
          </p>
        </div>

        {/* First Row: Stats and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
          {/* Your Stats Card */}
          <Card className="overflow-hidden border border-gray-700/30 shadow-xl bg-gray-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 text-gray-100">
                <Award className="h-5 sm:h-6 w-5 sm:w-6 text-[#00D992]" />
                Your Stats
              </CardTitle>
              <p className="text-sm sm:text-base text-gray-300">
                Complete tasks and refer friends to earn more SAGE
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/30">
                  <p className="text-xs text-gray-400 mb-1">Total Points</p>
                  <p className="text-xl font-bold text-gray-100">
                    {formatNumber(user?.total_points || 0, 2)}
                  </p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/30">
                  <p className="text-xs text-gray-400 mb-1">Tasks Completed</p>
                  <p className="text-xl font-bold text-gray-100">
                    {completedTasks}/{tasks.length}
                  </p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/30">
                  <p className="text-xs text-gray-400 mb-1">Referrals</p>
                  <p className="text-xl font-bold text-gray-100">
                    {formatNumber(user?.total_referrals || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Card */}
          <Card className="border border-gray-700/30 shadow-xl bg-gray-800/30">
            <CardHeader className="pb-2 border-b border-gray-700/30">
              <Badge className="w-fit mb-2 bg-[#00D992]/90 hover:bg-[#00F5A8]/90 text-gray-900 border-none">
                Tasks
              </Badge>
              <CardTitle className="text-lg sm:text-xl text-gray-100">
                Complete Tasks to Earn
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-400">
                Finish all tasks to maximize your SAGE
              </p>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-3 sm:space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-[#00D992]/30 transition-all gap-4 sm:gap-3"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-gray-800/50 flex items-center justify-center">
                        {task.icon}
                      </div>
                      <div className="min-w-0 flex-1 sm:flex-none">
                        <h3 className="font-medium text-gray-100">
                          {task.title}
                        </h3>
                        <p className="text-xs text-gray-400 max-w-[300px] sm:max-w-[200px]">
                          {task.description}
                        </p>

                        {task.id === 3 && (
                          <div className="mt-2 w-full sm:max-w-[200px]">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>
                                {user?.total_referrals || 0 < 5
                                  ? user?.total_referrals || 0
                                  : 5}{" "}
                                of 5 referrals
                              </span>
                              <span>{Math.round(referralProgress)}%</span>
                            </div>
                            <Progress
                              value={referralProgress}
                              className="h-1.5 bg-gray-700"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <Badge
                        variant="outline"
                        className="bg-gray-800/50 border-gray-600/30 text-gray-300"
                      >
                        +{formatNumber(task.points, 2)} SAGE
                      </Badge>
                      <Button
                        onClick={() => {
                          if (task.link) {
                            window.open(task.link, "_blank");
                          }
                          completeTask(task.id);
                          if (task.action) {
                            task.action();
                          }
                        }}
                        variant={task.completed ? "secondary" : "default"}
                        disabled={
                          task.completed ||
                          (task.id === 3 && (user?.total_referrals || 0) < 5)
                        }
                        className={
                          task.completed
                            ? "bg-[#00D992]/20 text-[#00D992] hover:bg-[#00D992]/30"
                            : "bg-[#00D992]/90 hover:bg-[#00F5A8]/90 text-gray-900"
                        }
                        size="sm"
                      >
                        {task.completed ? (
                          <>
                            <Check className="h-4 w-4 mr-1" /> Done
                          </>
                        ) : (
                          "Complete"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row: Referral and Social Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
          {/* Referral Card */}
          <Card className="border border-gray-700/30 shadow-xl bg-gray-800/30">
            <CardHeader className="pb-2 border-b border-gray-700/30">
              <Badge className="w-fit mb-2 bg-[#00D992]/90 hover:bg-[#00F5A8]/90 text-gray-900 border-none">
                Refer & Earn
              </Badge>
              <CardTitle className="text-gray-100">
                Share Your Referral Link
              </CardTitle>
              <p className="text-sm text-gray-400 flex items-center">
                <TooltipInfo
                  text="Your friends earn 10 SAGE each when they join using your referral link. You will also earn 10 SAGE when they follow @0xtrendsage on X."
                  className="mr-2"
                />
                Refer and Earn 10 SAGE each time someone uses your referral
                link.
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <ReferralCard
                referralCode={referralCode}
                referralUrl={referralUrl}
              />
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

          {/* Social Card */}
          <Card className="border border-gray-700/30 shadow-xl bg-gray-800/30">
            <CardHeader className="pb-2 border-b border-gray-700/30">
              <Badge className="w-fit mb-2 bg-[#00D992]/90 hover:bg-[#00F5A8]/90 text-gray-900 border-none">
                Social Card
              </Badge>
              <CardTitle className="text-gray-100">
                Share Your Social Card
              </CardTitle>
              <p className="text-sm text-gray-400">
                Generate and share your achievements and stats with your network
              </p>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col items-center gap-4">
              {/* Social Card Preview */}
              <div className="w-full max-w-md">
                <img
                  src={user ? `/api/social-card?${new URLSearchParams({
                    name: user.name || "TrendSage",
                    handle: user.x_handle || "0xtrendsage",
                    followers: (user.followers || 0).toString(),
                    rewards: (user.total_points || 0).toString(),
                    profileImage: user.profile_image_url || "",
                  })}` : "/api/social-card"}
                  alt="Social Card Preview"
                  className="w-full h-auto rounded-lg border border-gray-600/30 shadow-lg"
                  style={{ aspectRatio: "1200/628" }}
                />
              </div>
              
              <div className="w-full grid grid-cols-2 gap-4">
                <Button
                  onClick={copySocialCard}
                  disabled={isSocialCardCopying}
                  className="w-full bg-gray-700/30 hover:bg-gray-600/30 text-gray-100 border border-gray-600/30"
                >
                  {isSocialCardCopying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Copying...
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Card
                    </>
                  )}
                </Button>
                <Button
                  onClick={downloadSocialCard}
                  disabled={isSocialCardDownloading}
                  className="w-full bg-gray-700/30 hover:bg-gray-600/30 text-gray-100 border border-gray-600/30"
                >
                  {isSocialCardDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Card
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="border border-gray-700/30 shadow-xl bg-gray-800/30 mb-4 sm:mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl text-gray-100">
              Buzz Leaderboard
            </CardTitle>
            <CardDescription className="text-sm text-gray-400">
              Top users ranked by Buzz points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700/30">
                    <TableHead className="w-[50px] text-gray-400">
                      Rank
                    </TableHead>
                    <TableHead className="text-gray-400">Name</TableHead>
                    <TableHead className="text-center text-gray-400">
                      Buzz Score
                    </TableHead>
                    <TableHead className="text-center text-gray-400">
                      Smart Followers
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLeaderboardLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D992]"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : leaderboardError ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-red-400"
                      >
                        {leaderboardError}
                      </TableCell>
                    </TableRow>
                  ) : leaderboardData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-gray-400"
                      >
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaderboardData.map((user, index) => (
                      <TableRow
                        key={user.author_handle}
                        className="border-gray-700/30"
                      >
                        <TableCell className="font-medium text-gray-300">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                className="rounded-full"
                                src={
                                  user.profile_image_url ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.author_handle}`
                                }
                              />
                              <AvatarFallback className="bg-gray-700/30 text-gray-300">
                                {user.name?.slice(0, 2) ||
                                  user.author_handle.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-100">
                                {user.name || user.author_handle}
                              </div>
                              <div className="text-xs text-gray-400">
                                @{user.author_handle}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium text-gray-300">
                          {formatNumber(user.score, 2)}
                        </TableCell>
                        <TableCell className="text-center text-gray-300">
                          {formatNumber(user.smart_followers)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {showPagination && (
              <div className="mt-4 overflow-x-auto -mx-4 sm:mx-0">
                <div className="flex items-center justify-between px-4 sm:px-0">
                  <Pagination>
                    <PaginationContent className="flex-wrap gap-2">
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1 || isLeaderboardLoading}
                          className={`
                            ${
                              currentPage === 1
                                ? "opacity-50"
                                : "hover:bg-[#00D992]/10 hover:text-white hover:border-[#00D992]"
                            }
                            text-gray-300 bg-gray-700/30 border-gray-600/30
                          `}
                        >
                          Prev
                        </Button>
                      </PaginationItem>

                      {Array.from(
                        { length: Math.min(3, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return pageNum;
                        }
                      ).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                            className={`
                              ${
                                page === currentPage
                                  ? "bg-[#00D992]/90 text-gray-900"
                                  : "text-gray-300 hover:text-gray-100 bg-gray-700/30 border-gray-600/30"
                              }
                            `}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={
                            currentPage === totalPages || isLeaderboardLoading
                          }
                          className={`
                            ${
                              currentPage === totalPages
                                ? "opacity-50"
                                : "hover:bg-[#00D992]/10 hover:text-white hover:border-[#00D992]"
                            }
                            text-gray-300 bg-gray-700/30 border-gray-600/30
                          `}
                        >
                          Next
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EarnPage;
