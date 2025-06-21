import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_TRENDSAGE_API_URL ||
  process.env.NEXT_PUBLIC_CREDBUZZ_API_URL ||
  "https://api.cred.buzz";

export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const { handle } = params;

    // Fetch user profile data
    const userProfileResponse = await fetch(
      `${API_BASE_URL}/user/get-user-profile?handle=${handle}`
    );

    if (!userProfileResponse.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const userProfileData = await userProfileResponse.json();
    const profileImage = userProfileData?.result?.activity_data?.profile_image;
    const chartData = userProfileData?.result?.chart_data;

    // Fetch author details for additional info
    const authorDetailsResponse = await fetch(
      `${API_BASE_URL}/user/author-handle-details?author_handle=${handle}`
    );

    let authorName = handle;
    let authorBio = "";
    let followersCount = 0;
    let smartFollowersCount = 0;
    let mindshare = 0;

    if (authorDetailsResponse.ok) {
      const authorData = await authorDetailsResponse.json();
      authorName = authorData?.result?.name || handle;
      authorBio = authorData?.result?.bio || "";
    }

    // Get latest metrics from chart data
    if (chartData && chartData.length > 0) {
      const latestData = chartData[chartData.length - 1];
      followersCount = latestData[2];
      smartFollowersCount = latestData[3];
      mindshare = latestData[4];
    }

    // Create the Open Graph image
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            backgroundColor: "#0A0F1A",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, rgba(55, 65, 81, 0.15) 2px, transparent 0), radial-gradient(circle at 75px 75px, rgba(55, 65, 81, 0.1) 2px, transparent 0)",
            backgroundSize: "100px 100px",
            padding: "48px 32px",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              marginBottom: "24px",
              width: "100%",
              maxWidth: "800px",
            }}
          >
            {/* Profile Image */}
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "20px",
                backgroundImage: profileImage
                  ? `url(${profileImage})`
                  : "linear-gradient(135deg, #00D992 0%, #00A97F 100%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "2px solid rgba(0, 217, 146, 0.6)",
                boxShadow: "0 0 20px rgba(0, 217, 146, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!profileImage && (
                <div
                  style={{
                    fontSize: "48px",
                    color: "#FFFFFF",
                    fontWeight: "bold",
                  }}
                >
                  {handle.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Title and Handle */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "4px",
              }}
            >
              <h1
                style={{
                  fontSize: "72px",
                  fontWeight: "bold",
                  color: "#F9FAFB",
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {authorName}
              </h1>
              <span
                style={{
                  fontSize: "20px",
                  color: "#00D992",
                  opacity: 0.9,
                  fontWeight: "500",
                }}
              >
                @{handle}
              </span>
            </div>
          </div>

          {/* Stats Section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "32px",
              marginBottom: "48px",
            }}
          >
            {/* Followers */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "rgba(17, 24, 39, 0.95)",
                borderRadius: "12px",
                padding: "16px 24px",
                border: "1px solid rgba(55, 65, 81, 0.3)",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  color: "#00D992",
                  fontWeight: "600",
                }}
              >
                {followersCount.toLocaleString()}
              </span>
              <span
                style={{
                  fontSize: "16px",
                  color: "#9CA3AF",
                  fontWeight: "500",
                }}
              >
                Followers
              </span>
            </div>

            {/* Smart Followers */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "rgba(17, 24, 39, 0.95)",
                borderRadius: "12px",
                padding: "16px 24px",
                border: "1px solid rgba(55, 65, 81, 0.3)",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  color: "#00D992",
                  fontWeight: "600",
                }}
              >
                {smartFollowersCount.toLocaleString()}
              </span>
              <span
                style={{
                  fontSize: "16px",
                  color: "#9CA3AF",
                  fontWeight: "500",
                }}
              >
                Smart Followers
              </span>
            </div>

            {/* Mindshare */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "rgba(17, 24, 39, 0.95)",
                borderRadius: "12px",
                padding: "16px 24px",
                border: "1px solid rgba(55, 65, 81, 0.3)",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  color: "#00D992",
                  fontWeight: "600",
                }}
              >
                {mindshare.toFixed(1)}%
              </span>
              <span
                style={{
                  fontSize: "16px",
                  color: "#9CA3AF",
                  fontWeight: "500",
                }}
              >
                Mindshare
              </span>
            </div>
          </div>

          {/* Bio Section */}
          {authorBio && (
            <div
              style={{
                maxWidth: "800px",
                textAlign: "center",
                color: "#D1D5DB",
                fontSize: "20px",
                lineHeight: 1.5,
              }}
            >
              {authorBio.length > 200
                ? `${authorBio.slice(0, 200)}...`
                : authorBio}
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Failed to generate OG image:", error);

    // Return a fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#111827",
            color: "#F9FAFB",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            TrendSage KOL Profile
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#9CA3AF",
              textAlign: "center",
            }}
          >
            Web3 KOL Marketplace
          </p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
