import FollowersOverview from "@/app/components/FollowersOverview";
import TokenOverview from "@/app/components/TokenOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import KOLProfileHeader from "../../../components/KOLProfileHeader";
import { ProfileCharts } from "../../components/ProfileCharts";
import SmartFeed from "../../components/SmartFeed";
import type {
  AuthorDetailsResponse,
  ChartDataPoint,
  ProfileData,
  UserProfileResponse,
} from "../../types";

async function fetchUserProfile(
  authorHandle: string,
  attempt = 0
): Promise<UserProfileResponse | null> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  // Use absolute URL for server-side fetch
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const response = await fetch(
      `${baseUrl}/api/user/get-user-profile?handle=${authorHandle}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return (await response.json()) as UserProfileResponse;
      }
    }
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.log(
      `User profile API fetch failed (attempt ${attempt + 1}):`,
      error
    );

    // Retry logic
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchUserProfile(authorHandle, attempt + 1);
    }
  }
  return null;
}

async function fetchAuthorDetails(
  authorHandle: string,
  attempt = 0
): Promise<AuthorDetailsResponse | null> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  // Use absolute URL for server-side fetch
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const response = await fetch(
      `${baseUrl}/api/user/author-handle-details?author_handle=${authorHandle}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return (await response.json()) as AuthorDetailsResponse;
      }
    }
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.log(
      `Author details API fetch failed (attempt ${attempt + 1}):`,
      error
    );

    // Retry logic
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchAuthorDetails(authorHandle, attempt + 1);
    }
  }
  return null;
}

async function getProfileData(authorHandle: string): Promise<{
  profile: ProfileData;
  chartData: ChartDataPoint[];
  activityData: UserProfileResponse["result"]["activity_data"];
} | null> {
  try {
    // Make parallel API calls but handle them separately
    const userProfileData = await fetchUserProfile(authorHandle);

    // If user profile data is not available, we can't show anything meaningful
    if (!userProfileData?.result) {
      return null;
    }

    // Process chart data which we know exists since userProfileData.result exists
    const chartData = userProfileData.result.chart_data.map(
      ([date, label, followers, smartFollowers, mindshare]) => ({
        date,
        label,
        followers_count: followers,
        smart_followers_count: smartFollowers,
        mindshare,
      })
    );

    // Try to get author details but don't fail if unavailable
    let authorDetailsData = null;
    try {
      authorDetailsData = await fetchAuthorDetails(authorHandle);
    } catch (error) {
      // Continue without author details
    }

    // Get the latest metrics from chart data or use defaults
    const latestMetrics =
      chartData.length > 0
        ? chartData[chartData.length - 1]
        : {
            followers_count: 0,
            smart_followers_count: 0,
            mindshare: 0,
          };

    // Create profile with fallbacks for author details
    const profile: ProfileData = {
      name:
        authorDetailsData && authorDetailsData.result
          ? authorDetailsData.result.name
          : authorHandle,
      author_handle: authorHandle,
      bio:
        authorDetailsData && authorDetailsData.result
          ? authorDetailsData.result.bio
          : "",
      profile_image_url: userProfileData.result.activity_data.profile_image,
      followers_count: latestMetrics.followers_count,
      smart_followers_count: latestMetrics.smart_followers_count,
      mindshare: latestMetrics.mindshare,
      account_created_at:
        authorDetailsData && authorDetailsData.result
          ? authorDetailsData.result.account_created_at
          : undefined,
    };

    return {
      profile,
      chartData,
      activityData: userProfileData.result.activity_data,
    };
  } catch (error) {
    console.log("API fetch failed for profile:", authorHandle, error);
    return null;
  }
}

function formatAccountCreatedDate(dateString?: string): string {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffYears > 0) {
      return `Joined ${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
    } else if (diffMonths > 0) {
      return `Joined ${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    } else {
      return `Joined ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }
  } catch (error) {
    return "";
  }
}

// Server-side metadata generation
export async function generateMetadata({
  params,
}: {
  params: { profileName: string };
}): Promise<Metadata> {
  const { profileName } = params;
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_TRENDSAGE_API_URL ||
    process.env.NEXT_PUBLIC_CREDBUZZ_API_URL ||
    "https://api.cred.buzz";

  try {
    // Fetch user profile data
    const userProfileResponse = await fetch(
      `${API_BASE_URL}/user/get-user-profile?handle=${profileName}`
    );

    if (!userProfileResponse.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const userProfileData = await userProfileResponse.json();

    // Fetch author details for additional info
    const authorDetailsResponse = await fetch(
      `${API_BASE_URL}/user/author-handle-details?author_handle=${profileName}`
    );

    let authorName = profileName;
    let authorBio = "";

    if (authorDetailsResponse.ok) {
      const authorData = await authorDetailsResponse.json();
      authorName = authorData?.result?.name || profileName;
      authorBio = authorData?.result?.bio || "";
    }

    // Create an optimized title
    const baseTitle = authorName;
    const titleSuffix = " | TrendSage KOL";
    const title =
      baseTitle.length > 40
        ? `${baseTitle.substring(0, 37)}...${titleSuffix}`
        : `${baseTitle}${titleSuffix}`;

    const description =
      authorBio.length > 150
        ? `${authorBio.slice(0, 150)}...`
        : authorBio ||
          `Check out ${authorName}'s Web3 KOL profile on TrendSage`;

    // Ensure absolute URLs for images
    const domain = process.env.NEXT_PUBLIC_APP_URL || "https://trendsage.xyz";
    const ogImageUrl = `${domain}/api/og/kol/${profileName}`;
    const pageUrl = `${domain}/kols/${profileName}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: "TrendSage",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${authorName}'s TrendSage KOL Profile`,
          },
        ],
        locale: "en_US",
        type: "profile",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImageUrl],
        creator: "@trendsage_xyz",
      },
    };
  } catch (error) {
    return {
      title: "TrendSage KOL Profile",
      description: "Web3 KOL Marketplace",
    };
  }
}

export default async function ProfilePage({
  params,
}: {
  params: { profileName: string };
}) {
  const { profileName } = await params;

  if (!profileName) {
    redirect("/kols/eliz883");
  }

  const data = await getProfileData(profileName);

  if (!data) {
    notFound();
  }

  const { profile, chartData, activityData } = data;
  const accountCreatedText = formatAccountCreatedDate(
    profile.account_created_at
  );

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="flex items-start">
        {/* Main Content */}
        <div className="flex-1 py-8 pl-8 lg:pl-12 pr-4">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <KOLSearch />

            {/* Profile Header */}
            <KOLProfileHeader
              profile={profile}
              accountCreatedText={accountCreatedText}
            />

            {/* Chart Cards */}
            <ProfileCharts
              chartData={chartData}
              activityData={activityData}
              authorHandle={profile.author_handle}
            />

            {/* Market Cap Distribution */}
            <div className="mt-8">
              <MarketCapDistribution authorHandle={profile.author_handle} />
            </div>

            {/* Token Overview Section */}
            <div className="mt-8">
              <TokenOverview authorHandle={profile.author_handle} />
            </div>
            {/* Campaign Header */}
            <KOLProfileHeader
              profile={profile}
              accountCreatedText={accountCreatedText}
            />
            <div className="flex flex-col h-full w-full">
              {/* Tabbed Interface for Mentions and Followers */}
              <Tabs defaultValue="mentions" className="w-full h-full mt-5">
                <TabsList className="flex justify-start bg-transparent rounded-none p-0">
                  {[
                    { label: "Token Mentions", value: "mentions" },
                    { label: "Followers Overview", value: "followers" },
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="px-5 border-b pb-5 border-neutral-600 text-sm font-medium rounded-none text-gray-400 hover:text-gray-200 data-[state=active]:mb-0 data-[state=active]:bg-transparent data-[state=active]:text-[#00D992] data-[state=active]:border-b-2 data-[state=active]:border-[#00D992] transition-colors bg-transparent"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent
                  value="mentions"
                  className=" mt-1 w-full  border-t  border-neutral-600 "
                >
                  {/* Community Mindshare */}
                  <div className="flex flex-row w-full h-full gap-4 ">
                    <div className="w-full md:w-[56%] flex flex-col h-[500px] items-center justify-center text-lg font-semibold text-gray-200 bg-neutral-200/5 backdrop-blur-xl">
                      {/* <FollowersOverview authorHandle={profile.author_handle} /> */}
                      Coming Soon
                    </div>
                    <div className="w-full md:w-[44%] flex flex-col h-full border border-t-0 border-dashed border-neutral-600 ">
                      <ProfileCharts
                        chartData={chartData}
                        activityData={activityData}
                        authorHandle={profile.author_handle}
                      />
                    </div>
                  </div>

                  {/* Leaderboard moved to Accounts tab in Feed */}
                </TabsContent>

                <TabsContent
                  value="followers"
                  className="mt-1 w-full  border-t  border-neutral-600 "
                >
                  {/* Followers Overview */}
                  <div className="flex flex-row w-full h-full gap-4 ">
                    <div className="w-full md:w-[56%] flex flex-col h-full">
                      <FollowersOverview authorHandle={profile.author_handle} />
                    </div>
                    <div className="w-full md:w-[44%] flex flex-col h-full border border-t-0 border-dashed border-neutral-600 p-4 ">
                      <SmartFeed authorHandle={profile.author_handle} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Feed with Accounts/Mentions Tabs */}
              <div className="w-full md:w-[44%] flex flex-col h-full">
                {/* External Time Period Filters */}
                {/* <div className="flex justify-between  pt-4 border-b border-neutral-600 pb-4">
                  <div className="flex gap-1 bg-transparent rounded-lg border border-neutral-600">
                    {["30d", "7d", "1d"].map((period) => (
                      <button
                        key={period}
                        onClick={() => {
                          setSelectedTimePeriod(period as TimePeriod);
                          setCurrentPage(1);
                        }}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          selectedTimePeriod === period
                            ? "bg-neutral-700 text-neutral-100"
                            : "text-neutral-300 hover:text-neutral-100"
                        }`}
                      >
                        {period === "1d" ? "24H" : period.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div> */}
                {/* <Tabs
                  defaultValue="accounts"
                  className="w-full h-full mt-0 p-4 border border-neutral-600 border-dashed border-t-0  flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-neutral-100">
                      Feed
                    </h3>
                    <TabsList className="inline-flex p-0 items-center bg-transparent rounded-md border border-neutral-600">
                      {[
                        { label: "Accounts", value: "accounts" },
                        { label: "Mentions", value: "mentions" },
                      ].map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="px-4 py-2 text-sm font-medium text-neutral-100 hover:text-white rounded-md transition-colors data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100"
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div> */}
                {/* Accounts Tab - Campaign Leaderboard */}
                {/* <TabsContent value="accounts" className="space-y-4">
                    {mindshareData?.result?.mindshare_data &&
                      mindshareData.result.mindshare_data.length > 0 && (
                        <CampaignLeaderboard
                          data={mindshareData.result.mindshare_data}
                          totalResults={mindshareData.result.total_results}
                          campaignId={campaignId}
                          selectedTimePeriod={selectedTimePeriod}
                          currentPage={currentPage}
                          followersLimit={followersLimit}
                          onPageChange={handlePageChange}
                        />
                      )}
                  </TabsContent>
                </Tabs> */}
              </div>
            </div>
          </div>
        </div>

        {/* Smart Feed Sidebar - Matches main content height */}
        <div className="w-[480px] lg:w-[480px] md:w-80 sm:w-72 py-8 pr-8 lg:pr-12 self-stretch sticky top-16 h-[calc(100vh-4rem)]">
          <SmartFeed authorHandle={profile.author_handle} />
        </div>
      </div>
    </div>
  );
}
