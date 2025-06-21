import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_TRENDSAGE_API_URL ||
  process.env.NEXT_PUBLIC_CREDBUZZ_API_URL ||
  "https://api.cred.buzz";

// Simple function to get image URL based on handle
const getImageUrlForHandle = (handle: string) => {
  const images = [
    {
      handle: "infinex",
      imageUrl: "https://alliancehub.s3.eu-west-1.amazonaws.com/1004507388.jpg",
    },
    {
      handle: "boopdotfun",
      imageUrl: "https://alliancehub.s3.eu-west-1.amazonaws.com/1009622081.jpg",
    },
    {
      handle: "vmfcoin",
      imageUrl: "https://alliancehub.s3.eu-west-1.amazonaws.com/1011002498.jpg",
    },
    {
      handle: "jessexbt_ai",
      imageUrl: "https://alliancehub.s3.eu-west-1.amazonaws.com/1018173201.jpg",
    },
  ];

  const match = images.find((img) => img.handle === handle);
  return match ? match.imageUrl : images[0].imageUrl;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;

    // Fetch campaign data
    const campaignResponse = await fetch(
      `${API_BASE_URL}/campaign/get-campaigns`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaign_id: campaignId,
        }),
      }
    );

    if (!campaignResponse.ok) {
      throw new Error("Failed to fetch campaign");
    }

    const campaignData = await campaignResponse.json();
    const campaign = campaignData?.result?.[0];

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Get handle-based image
    const handleImageUrl = campaign.target_x_handle
      ? getImageUrlForHandle(
          campaign.target_x_handle.replace("@", "").toLowerCase()
        )
      : null;

    // Fetch mindshare data if available
    let mindshareData = null;
    if (campaign.target_x_handle) {
      try {
        const handle = campaign.target_x_handle.replace("@", "").toLowerCase();
        const mindshareResponse = await fetch(
          `${API_BASE_URL}/mindshare?project_name=${handle}&limit=5&period=30d`
        );
        if (mindshareResponse.ok) {
          const data = await mindshareResponse.json();
          mindshareData = data?.result?.mindshare_data?.slice(0, 5) || [];
        }
      } catch (error) {
        console.error("Failed to fetch mindshare:", error);
      }
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
            {handleImageUrl && (
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "20px",
                  backgroundImage: `url(${handleImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  border: "2px solid rgba(0, 217, 146, 0.6)",
                  boxShadow: "0 0 20px rgba(0, 217, 146, 0.15)",
                }}
              />
            )}

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
                {campaign.campaign_name}
              </h1>
              {campaign.target_x_handle && (
                <span
                  style={{
                    fontSize: "20px",
                    color: "#00D992",
                    opacity: 0.9,
                    fontWeight: "500",
                  }}
                >
                  {campaign.target_x_handle.replace("@", "")}
                </span>
              )}
            </div>
          </div>

          {/* Amount Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "48px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(17, 24, 39, 0.95)",
                borderRadius: "12px",
                padding: "12px 20px",
                border: "1px solid rgba(55, 65, 81, 0.3)",
              }}
            >
              <span
                style={{
                  fontSize: "24px",
                  color: "#00D992",
                  fontWeight: "500",
                }}
              >
                💰 {campaign.amount} {campaign.payment_token}
              </span>
            </div>
          </div>

          {/* Mindshare Section */}
          {mindshareData && mindshareData.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <h2
                style={{
                  fontSize: "36px",
                  color: "#00D992",
                  marginBottom: "32px",
                  fontWeight: "600",
                }}
              >
                Community Mindshare Leaders
              </h2>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "24px",
                  flexWrap: "wrap",
                  width: "100%",
                  maxWidth: "1000px",
                }}
              >
                {mindshareData.map((influencer: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      backgroundColor: "rgba(17, 24, 39, 0.7)",
                      borderRadius: "16px",
                      padding: "24px",
                      minWidth: "220px",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "90px",
                        height: "90px",
                        borderRadius: "50%",
                        backgroundColor: "#374151",
                        backgroundImage: influencer.user_info?.profile_image_url
                          ? `url(${influencer.user_info.profile_image_url})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "18px",
                        color: "#F9FAFB",
                        fontWeight: "500",
                        textAlign: "center",
                      }}
                    >
                      {influencer.user_info?.name ||
                        influencer.author_handle ||
                        "Unknown"}
                    </span>
                    <span
                      style={{
                        fontSize: "24px",
                        color: "#00D992",
                        fontWeight: "600",
                      }}
                    >
                      {influencer.mindshare_percent?.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
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
            TrendSage Campaign
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
