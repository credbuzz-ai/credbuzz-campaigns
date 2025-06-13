"use client";
import MindshareTreemap from "@/app/components/MindshareTreemap";
import { AuthorData, MindshareResponse } from "@/app/types";
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

  const fetchMindshare = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/mindshare?project_name=${projectName}&limit=50`
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
  }, [projectName]);

  if (!authorData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-6 rounded-xl bg-white shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-3 text-sm text-gray-600">Loading profile...</p>
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-6 bg-white shadow-lg">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-3 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Image */}
      <div className="relative h-48 md:h-56 w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 z-10" />
        <Image
          src={authorData.profile_banner_url}
          alt="Profile Banner"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Profile Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="card-trendsage">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="relative h-28 w-28 rounded-xl overflow-hidden border-4 border-gray-700 shadow-xl transform -mt-16 md:-mt-20">
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
              { label: "Crypto Tweets", value: authorData.crypto_tweets_all },
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
      </div>

      {/* Mindshare Treemap */}
      {mindshareData && mindshareData.result.mindshare_data.length > 0 && (
        <div className="mt-8">
          <MindshareTreemap data={mindshareData.result.mindshare_data} />
        </div>
      )}
    </div>
  );
}
