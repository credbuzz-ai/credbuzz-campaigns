"use client";
import FollowersOverview from "@/app/components/FollowersOverview";
import InfluencerMatchMaking from "@/app/components/InfluencerMatchmaking";
import MarketCapDistribution from "@/app/components/MarketCapDistribution";
import { ActivityChart } from "@/app/components/ProfileCharts";
import ProjectSearch from "@/app/components/ProjectSearch";
import SmartFeed from "@/app/components/SmartFeed";
import {
  AuthorData,
  MindshareResponse,
  UserProfileResponse,
} from "@/app/types";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import ProjectProfileHeader from "../../../components/ProjectProfileHeader";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function ProjectPage({
  params,
}: {
  params: { projectName: string };
}) {
  const { projectName } = params;
  const [authorData, setAuthorData] = useState<AuthorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [mindshareData, setMindshareData] = useState<MindshareResponse | null>(
    null
  );
  const [timeframe, setTimeframe] = useState<"30d" | "7d" | "24h">("24h");
  const [activityData, setActivityData] = useState<
    UserProfileResponse["result"]["activity_data"] | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/api/user/search-authors?search_term=${projectName.toLowerCase()}&limit=1&start=0&category=projects`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        }
      );
      const data = await response.json();
      if (!data.result?.[0]) {
        return notFound();
      }
      setAuthorData(data.result[0]);
    } catch (error) {
      console.error("Error fetching project:", error);
      return notFound();
    }
  };

  const fetchActivityData = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/api/user/get-user-profile?handle=${projectName}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        }
      );
      const data = await response.json();
      if (data.result?.activity_data) {
        setActivityData(data.result.activity_data);
      }
    } catch (error) {
      console.error("Error fetching activity data:", error);
    }
  };

  const fetchMindshare = async () => {
    try {
      setLoading(true);
      const period = timeframe === "24h" ? "1d" : timeframe;
      const offset = (currentPage - 1) * pageSize;
      const handle = projectName.toLowerCase();

      // Fetch paginated data for the table
      const paginatedResponse = await apiClient.get(
        `/mindshare?project_name=${handle}&limit=${pageSize}&offset=${offset}&period=${period}`
      );
      setMindshareData(paginatedResponse.data);
    } catch (err) {
      console.error("Error fetching mindshare:", err);
      setMindshareData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchMindshare();
    fetchActivityData();
  }, [projectName, timeframe, currentPage]);

  if (!authorData || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 justify-center items-center flex flex-col">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00D992]"></div>
          <p className="mt-3 text-lg text-gray-300">Loading project...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", { notation: "compact" }).format(num);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex items-start">
        {/* Main Content */}
        <div className="flex-1 py-8 pl-8 lg:pl-12 pr-4">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <ProjectSearch />

            {/* Project Profile Section */}
            <ProjectProfileHeader
              project={authorData}
              accountCreatedText={`Joined ${formatDate(
                authorData.account_created_at
              )}`}
            />

            {/* Job Manager - Influencer Matchmaking */}
            <div className="mt-8">
              <InfluencerMatchMaking projectHandle={authorData.author_handle} />
            </div>

            {/* Followers Overview */}
            <div className="mt-8">
              <FollowersOverview authorHandle={authorData.author_handle} />
            </div>

            {/* Activity Heatmap */}
            {activityData && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-foreground">
                  Activity Heatmap
                </h2>
                <div className="card-trendsage">
                  <ActivityChart activityData={activityData} />
                </div>
              </div>
            )}

            {/* Mindshare Visualization */}
            {mindshareData &&
              mindshareData.result.mindshare_data.length > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-foreground">
                      Project Mindshare
                    </h2>
                    <div className="flex gap-2">
                      {["30d", "7d", "24h"].map((period) => (
                        <button
                          key={period}
                          onClick={() => {
                            setTimeframe(period as "30d" | "7d" | "24h");
                            setCurrentPage(1);
                          }}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            timeframe === period
                              ? "bg-[#00D992] text-black"
                              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                  {mindshareData.result.total_results > pageSize && (
                    <div className="flex items-center justify-between mt-4 px-2">
                      <div className="text-sm text-gray-400">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(
                          currentPage * pageSize,
                          mindshareData.result.total_results
                        )}{" "}
                        of {mindshareData.result.total_results} results
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="border border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-[#00D992]/10 hover:text-white hover:border-[#00D992]"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-400">
                          Page {currentPage} of{" "}
                          {Math.ceil(
                            mindshareData.result.total_results / pageSize
                          )}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={
                            currentPage ===
                            Math.ceil(
                              mindshareData.result.total_results / pageSize
                            )
                          }
                          className="border border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-[#00D992]/10 hover:text-white hover:border-[#00D992]"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Market Cap Distribution */}
            <div className="mt-8">
              <MarketCapDistribution authorHandle={authorData.author_handle} />
            </div>
          </div>
        </div>

        {/* Smart Feed Sidebar */}
        <div className="w-[480px] lg:w-[480px] md:w-80 sm:w-72 py-8 pr-8 lg:pr-12 self-start sticky top-8">
          <SmartFeed authorHandle={authorData.author_handle} />
        </div>
      </div>
    </div>
  );
}
