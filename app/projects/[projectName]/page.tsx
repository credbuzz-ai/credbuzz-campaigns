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
import Image from "next/image";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

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
        `/mindshare?project_name=${projectName}&limit=100`
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
  }, [projectName]);

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
            <div className="card-trendsage mt-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Image */}
                <div className="relative h-28 w-28 rounded-xl overflow-hidden border-4 border-gray-700 shadow-xl">
                  <Image
                    src={authorData.profile_image_url}
                    alt={authorData.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">
                        {authorData.name}
                      </h1>
                      <p className="text-muted-foreground">
                        @{authorData.author_handle}
                      </p>
                    </div>
                    <a
                      href={`https://${authorData.url_in_bio}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      Visit Website
                    </a>
                  </div>
                  <p className="mt-2 text-foreground">{authorData.bio}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Joined {formatDate(authorData.account_created_at)}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Followers", value: authorData.followers_count },
                  { label: "Following", value: authorData.followings_count },
                  {
                    label: "Crypto Tweets",
                    value: authorData.crypto_tweets_all,
                  },
                  {
                    label: "Tweet Views",
                    value: authorData.crypto_tweets_views_all,
                  },
                ].map((stat) => (
                  <div key={stat.label} className="card-trendsage">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-xl font-bold text-foreground">
                      {formatNumber(stat.value)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Engagement Metrics */}
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-foreground">
                  Engagement Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Engagement Score",
                      value: authorData.engagement_score,
                    },
                    {
                      label: "Followers Impact",
                      value: authorData.followers_impact,
                    },
                    {
                      label: "Smart Followers",
                      value: authorData.smart_followers_count,
                    },
                  ].map((metric) => (
                    <div key={metric.label} className="card-trendsage">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {metric.label}
                      </p>
                      <p className="mt-1 text-2xl font-bold accent-trendsage">
                        {formatNumber(metric.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                  <h2 className="text-xl font-bold mb-4 text-foreground">
                    Project Mindshare
                  </h2>
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
