"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import { usePrivy } from "@privy-io/react-auth";
import { Award, Check, Copy, Share2 } from "lucide-react";
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
  id: number;
  name: string;
  username: string;
  buzzPoints: number;
  credScore: number;
  avatar?: string;
}

const EarnPage = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const { login, ready } = usePrivy();

  const referralCode = user?.referral_code || "0xtrendsage";
  const referralUrl = `${window.location.origin}/?referral_code=${referralCode}`;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState(user ? 1 : 0);
  const [referralCount, setReferralCount] = useState(
    user?.total_referrals || 0
  );
  const [referralProgress, setReferralProgress] = useState(
    (referralCount / 5) * 100
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isCopied, setIsCopied] = useState(false);

  // Mock leaderboard data
  const [leaderboardData] = useState<LeaderboardUser[]>([
    {
      id: 1,
      name: "Elon Musk",
      username: "@elonmusk",
      buzzPoints: 15420,
      credScore: 98,
    },
    {
      id: 2,
      name: "Naval Ravikant",
      username: "@naval",
      buzzPoints: 12835,
      credScore: 96,
    },
    {
      id: 3,
      name: "Sam Altman",
      username: "@sama",
      buzzPoints: 11750,
      credScore: 94,
    },
    {
      id: 4,
      name: "Paul Graham",
      username: "@paulg",
      buzzPoints: 10580,
      credScore: 92,
    },
    {
      id: 5,
      name: "Trung Phan",
      username: "@trungphan",
      buzzPoints: 9870,
      credScore: 91,
    },
  ]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = leaderboardData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leaderboardData.length / itemsPerPage);

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
        icon: <Award className="h-5 w-5 text-yellow-500" />,
        completed: (user?.total_referrals || 0) >= 5 ? true : false,
      },
    ];

    setTasks(initialTasks);
    setReferralCount(user?.total_referrals || 0);
    setCompletedTasks(initialTasks.filter((task) => task.completed).length);
  }, [user]);

  useEffect(() => {
    const progress = Math.min((referralCount / 5) * 100, 100);
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
    const text = `Join me on @0xtrendsage, the social platform for credibility scoring! Use my referral link: ${referralUrl} #0xtrendsage #Referral`;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    toast({
      title: "X share opened!",
    });
  };

  const shareOnTelegram = () => {
    const text = `Join me on 0xtrendsage, the social platform for credibility scoring! Use my referral link: ${referralUrl}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      referralUrl
    )}&text=${encodeURIComponent(text)}`;
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

  return (
    <div className="min-h-screen bg-gray-900/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-4">Earn SAGE</h1>
          <p className="text-xl text-gray-300">
            Complete tasks and earn rewards for your engagement
          </p>
        </div>

        <div className="mb-10">
          <Card className="overflow-hidden border border-gray-700/30 shadow-xl bg-gray-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold flex items-center gap-2 text-gray-100">
                <Award className="h-6 w-6 text-[#00D992]" />
                Your SAGE
              </CardTitle>
              <p className="text-gray-300">
                Complete tasks and refer friends to earn more points
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/30">
                  <p className="text-sm text-gray-400 mb-1">Total Points</p>
                  <p className="text-3xl font-bold text-gray-100">
                    {user?.total_points || 0}
                  </p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/30">
                  <p className="text-sm text-gray-400 mb-1">Tasks Completed</p>
                  <p className="text-3xl font-bold text-gray-100">
                    {completedTasks}/{tasks.length}
                  </p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/30">
                  <p className="text-sm text-gray-400 mb-1">Referrals</p>
                  <p className="text-3xl font-bold text-gray-100">
                    {user?.total_referrals || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border border-gray-700/30 shadow-xl bg-gray-800/30">
            <CardHeader className="pb-2 border-b border-gray-700/30">
              <Badge className="w-fit mb-2 bg-[#00D992]/90 hover:bg-[#00F5A8]/90 text-gray-900 border-none">
                Tasks
              </Badge>
              <CardTitle className="text-gray-100">
                Complete Tasks to Earn
              </CardTitle>
              <p className="text-sm text-gray-400">
                Finish all tasks to maximize your SAGE
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-[#00D992]/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-800/50 flex items-center justify-center">
                        {task.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-100">
                          {task.title}
                        </h3>
                        <p className="text-xs text-gray-400 max-w-[200px]">
                          {task.description}
                        </p>

                        {task.id === 3 && (
                          <div className="mt-2 w-full max-w-[200px]">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>
                                {user?.total_referrals || 0 < 5
                                  ? user?.total_referrals || 0
                                  : 5}{" "}
                                of 5 referrals
                              </span>
                              <span>
                                {Math.round(
                                  (user?.total_referrals || 0 / 5) * 100
                                )}
                                %
                              </span>
                            </div>
                            <Progress
                              value={referralProgress}
                              className="h-1.5 bg-gray-700"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="bg-gray-800/50 border-gray-600/30 text-gray-300"
                      >
                        +{task.points} SAGE
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

          <Card className="border border-gray-700/30 shadow-xl bg-gray-800/30">
            <CardHeader className="pb-2 border-b border-gray-700/30">
              <Badge className="w-fit mb-2 bg-[#00D992]/90 hover:bg-[#00F5A8]/90 text-gray-900 border-none">
                Refer & Earn
              </Badge>
              <CardTitle className="text-gray-100">
                Share Your Referral Link
              </CardTitle>
              <p className="text-sm text-gray-400">
                You and your friends earn 10 points each when they join using
                your referral link and follows @0xtrendsage on X
              </p>
            </CardHeader>

            {user ? (
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-6">
                  <div className="relative">
                    <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                      <p className="text-xs uppercase tracking-wider text-[#00D992] font-medium mb-1">
                        Your unique referral link
                      </p>
                      <div className="flex items-center">
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-medium tracking-wider text-gray-300 font-mono truncate">
                            {referralUrl}
                          </p>
                        </div>
                        <Button
                          onClick={copyReferralCode}
                          className="bg-gray-800/50 hover:bg-gray-700 text-gray-300 border border-gray-600/30"
                          size="sm"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-4 w-4" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" /> Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                </div>
              </CardContent>
            ) : (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-black/30">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 1200 1227"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        width="1200"
                        height="1227"
                        rx="300"
                        fill="#18181B"
                      />
                      <path
                        d="M860 320H1010L710 650L1050 1060H820L610 800L370 1060H220L540 710L210 320H450L640 560L860 320ZM820 980H890L470 400H400L820 980Z"
                        fill="#fff"
                      />
                    </svg>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold text-gray-100">
                      Join the Buzz—Connect X
                    </h3>
                    <p className="text-sm text-gray-400 max-w-[260px]">
                      Link your X account to get your unique referral link and
                      start earning points
                    </p>
                  </div>
                  <button
                    onClick={handleConnectX}
                    disabled={!ready}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-1 bg-[#18181B] hover:bg-[#232329] text-white font-medium rounded-lg shadow-sm border border-[#333] transition-all focus:outline-none focus:ring-2 focus:ring-[#00D992] focus:ring-offset-2 disabled:opacity-60"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 1200 1227"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        width="1200"
                        height="1227"
                        rx="300"
                        fill="#18181B"
                      />
                      <path
                        d="M860 320H1010L710 650L1050 1060H820L610 800L370 1060H220L540 710L210 320H450L640 560L860 320ZM820 980H890L470 400H400L820 980Z"
                        fill="#fff"
                      />
                    </svg>
                    Connect X
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* <Card className="border border-gray-700/30 shadow-xl bg-gray-800/30 mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-gray-100">
              SAGE Leaderboard
            </CardTitle>
            <CardDescription className="text-gray-400">
              Top users ranked by SAGE
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700/30">
                    <TableHead className="w-[50px] text-gray-400">
                      Rank
                    </TableHead>
                    <TableHead className="text-gray-400">Name</TableHead>
                    <TableHead className="text-center text-gray-400">
                      SAGE
                    </TableHead>
                    <TableHead className="text-center text-gray-400">
                      Cred Score
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((user, index) => (
                    <TableRow key={user.id} className="border-gray-700/30">
                      <TableCell className="font-medium text-gray-300">
                        {indexOfFirstItem + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border border-gray-600/30">
                            <AvatarImage
                              src={
                                user.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                              }
                            />
                            <AvatarFallback className="bg-gray-700/30 text-gray-300">
                              {user.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-100">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {user.username}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium text-gray-300">
                        {user.buzzPoints.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center text-gray-300">
                        {user.credScore}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className={`
                        ${
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                        text-gray-300 hover:text-gray-100 bg-gray-700/30 border-gray-600/30
                      `}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
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
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={`
                        ${
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                        text-gray-300 hover:text-gray-100 bg-gray-700/30 border-gray-600/30
                      `}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default EarnPage;
