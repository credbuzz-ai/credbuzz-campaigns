"use client";
import FollowersOverview from "@/app/components/FollowersOverview";
import InfluencerMatchMaking from "@/app/components/InfluencerMatchmaking";
import MarketCapDistribution from "@/app/components/MarketCapDistribution";
import MindshareTreemap from "@/app/components/MindshareTreemap";
import { ActivityChart } from "@/app/components/ProfileCharts";
import ProjectSearch from "@/app/components/ProjectSearch";
import SmartFeed from "@/app/components/SmartFeed";
import {
  AuthorData,
  MindshareResponse,
  UserProfileResponse,
} from "@/app/types";
import apiClient from "@/lib/api";
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
  const [mindshareData, setMindshareData] = useState<MindshareResponse | null>(
    null
  );
  const [timeframe, setTimeframe] = useState<"30d" | "7d" | "24h">("30d");
  const [activityData, setActivityData] = useState<
    UserProfileResponse["result"]["activity_data"] | null
  >(null);
  const [loading, setLoading] = useState(false);

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
      const response = await apiClient.get(
        `/mindshare?project_name=${projectName}&limit=100&timeframe=${timeframe}`
      );
      setMindshareData(response.data);
    } catch (err) {
      console.error("Error fetching mindshare:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchMindshare();
    fetchActivityData();
  }, [projectName, timeframe]);

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

            {/* Mindshare Treemap */}
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
                          onClick={() =>
                            setTimeframe(period as "30d" | "7d" | "24h")
                          }
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
                  <MindshareTreemap
                    data={mindshareData.result.mindshare_data}
                  />
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
