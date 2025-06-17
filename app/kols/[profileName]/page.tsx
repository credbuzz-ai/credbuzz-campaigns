import { notFound, redirect } from "next/navigation";
import KOLProfileHeader from "../../../components/KOLProfileHeader";
import KOLSearch from "../../../components/KOLSearch";
import MarketCapDistribution from "../../components/MarketCapDistribution";
import { ProfileCharts } from "../../components/ProfileCharts";
import SmartFeed from "../../components/SmartFeed";
import TokenOverview from "../../components/TokenOverview";
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
    // Make parallel API calls
    const [userProfileData, authorDetailsData] = await Promise.all([
      fetchUserProfile(authorHandle),
      fetchAuthorDetails(authorHandle),
    ]);

    if (userProfileData?.result) {
      const chartData = userProfileData.result.chart_data.map(
        ([date, label, followers, smartFollowers, mindshare]) => ({
          date,
          label,
          followers_count: followers,
          smart_followers_count: smartFollowers,
          mindshare,
        })
      );

      // Merge data from both APIs
      const profile: ProfileData = {
        name: authorDetailsData?.result?.name || authorHandle,
        author_handle: authorHandle,
        bio: authorDetailsData?.result?.bio || "",
        profile_image_url: userProfileData.result.activity_data.profile_image,
        followers_count: chartData[chartData.length - 1].followers_count,
        smart_followers_count:
          chartData[chartData.length - 1].smart_followers_count,
        mindshare: chartData[chartData.length - 1].mindshare,
        account_created_at: authorDetailsData?.result?.account_created_at,
      };

      return {
        profile,
        chartData,
        activityData: userProfileData.result.activity_data,
      };
    }
  } catch (error) {
    console.log("API fetch failed for profile:", authorHandle, error);
  }

  return null;
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
    <div className="min-h-screen bg-gray-900">
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
          </div>
        </div>

        {/* Smart Feed Sidebar - Matches main content height */}
        <div className="w-[480px] lg:w-[480px] md:w-80 sm:w-72 py-8 pr-8 lg:pr-12 self-start sticky top-8">
          <SmartFeed authorHandle={profile.author_handle} />
        </div>
      </div>
    </div>
  );
}
