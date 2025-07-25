import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_TRENDSAGE_API_URL ||
  process.env.NEXT_PUBLIC_CREDBUZZ_API_URL ||
  "https://api.cred.buzz";

// Treemap component function
function Treemap({
  data,
  width,
  height,
}: {
  data: any[];
  width: number;
  height: number;
}) {
  if (!data || data.length === 0) return null;

  // Sort data by mindshare_percent in descending order
  const sortedData = [...data].sort(
    (a, b) => b.mindshare_percent - a.mindshare_percent
  );
  // Take top 20 for visualization
  const topData = sortedData.slice(0, 20);

  // Calculate total mindshare for proportional sizing
  const totalMindshare = topData.reduce(
    (sum, item) => sum + item.mindshare_percent,
    0
  );

  // Helper to scale mindshare to dimensions
  function scaleDimension(mindshare: number, totalSize: number) {
    if (totalMindshare === 0) return totalSize / topData.length;
    return (mindshare / totalMindshare) * totalSize;
  }

  // Column-wise treemap layout algorithm
  function layoutTreemap(
    items: any[],
    x: number,
    y: number,
    w: number,
    h: number
  ): any[] {
    if (items.length === 0) return [];

    const result: any[] = [];

    // Calculate total mindshare for proportional sizing
    const totalMindshare = items.reduce(
      (sum, item) => sum + item.mindshare_percent,
      0
    );

    // Determine number of columns (aim for roughly square-ish columns)
    const numColumns = Math.ceil(Math.sqrt(items.length));
    const columnWidth = w / numColumns;

    // Group items into columns
    const columns: any[][] = [];
    for (let i = 0; i < numColumns; i++) {
      columns[i] = [];
    }

    // Distribute items across columns - fill one column completely before moving to next
    const itemsPerColumn = Math.ceil(items.length / numColumns);
    items.forEach((item, index) => {
      const columnIndex = Math.floor(index / itemsPerColumn);
      if (columnIndex < numColumns) {
        columns[columnIndex].push(item);
      }
    });

    // Layout each column
    columns.forEach((columnItems, columnIndex) => {
      if (columnItems.length === 0) return;

      const columnX = x + columnIndex * columnWidth;

      // Calculate total mindshare for this column
      const columnMindshare = columnItems.reduce(
        (sum, item) => sum + item.mindshare_percent,
        0
      );

      // Layout items vertically within the column
      let currentY = y;
      columnItems.forEach((item) => {
        const itemHeight = (item.mindshare_percent / columnMindshare) * h;

        result.push({
          ...item,
          x: columnX,
          y: currentY,
          width: columnWidth,
          height: itemHeight,
        });

        currentY += itemHeight;
      });
    });

    return result;
  }

  // Layout the treemap
  const layoutItems = layoutTreemap(topData, 0, 0, width, height);

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {layoutItems.map((item) => (
        <div
          key={item.author_handle}
          style={{
            position: "absolute",
            left: item.x,
            top: item.y,
            width: item.width,
            height: item.height,
            backgroundColor: "#222",
            border: "2px solid #333",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {item.user_info?.profile_image_url && (
            <img
              src={item.user_info.profile_image_url}
              alt={item.author_handle}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                top: 0,
                left: 0,
                opacity: 0.7,
              }}
            />
          )}

          {/* Mindshare Percentage Overlay */}
          <div
            style={{
              position: "absolute",
              top: "4px",
              left: "4px",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              padding: "2px 6px",
              borderRadius: "4px",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: Math.max(10, Math.min(16, item.width * 0.15)),
                fontWeight: "800",
                color: "#00D992",
                lineHeight: 1,
              }}
            >
              {item.mindshare_percent.toFixed(2)}%
            </span>
          </div>

          {/* Handle Overlay */}
          <div
            style={{
              position: "absolute",
              top: "4px",
              left: "4px",
              marginTop: Math.max(20, Math.min(30, item.height * 0.15)),
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: Math.max(8, Math.min(14, item.width * 0.12)),
                fontWeight: "600",
                color: "#FFFFFF",
                lineHeight: 1,
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
              }}
            >
              {item.author_handle}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

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

    // Get profile image from user profile API
    let profileImageUrl = null;
    if (campaign.target_x_handle) {
      try {
        const handle = campaign.target_x_handle.replace("@", "").toLowerCase();
        const userProfileResponse = await fetch(
          `${API_BASE_URL}/user/get-user-profile?handle=${handle}`
        );
        if (userProfileResponse.ok) {
          const data = await userProfileResponse.json();
          profileImageUrl = data?.result?.activity_data?.profile_image;
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    }

    // Fetch mindshare data if available
    let mindshareData = null;
    if (campaign.target_x_handle) {
      try {
        const handle = campaign.target_x_handle.replace("@", "").toLowerCase();
        const mindshareResponse = await fetch(
          `${API_BASE_URL}/mindshare?project_name=${handle}&limit=20&period=30d`
        );
        if (mindshareResponse.ok) {
          const data = await mindshareResponse.json();
          mindshareData = data?.result?.mindshare_data?.slice(0, 20) || [];
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
              gap: "16px",
              marginBottom: "24px",
              width: "100%",
              paddingLeft: "32px",
            }}
          >
            {/* Profile Image */}
            <div
              style={{
                width: "60px",
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {profileImageUrl && (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "16px",
                  }}
                />
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
                  fontSize: "36px",
                  fontWeight: "800",
                  color: "#F9FAFB",
                  margin: 0,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                }}
              >
                {campaign.campaign_name}
              </h1>
              {campaign.target_x_handle && (
                <span
                  style={{
                    fontSize: "18px",
                    color: "#00D992",
                    fontWeight: "700",
                    marginTop: "6px",
                    letterSpacing: "0.01em",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  @{campaign.target_x_handle}
                </span>
              )}
            </div>
          </div>

          {/* Mindshare Treemap Section */}
          {mindshareData && mindshareData.length > 0 && (
            <div
              style={{
                width: "100%",
                padding: "0 32px",
                marginBottom: "24px",
                display: "flex",
                flexDirection: "row",
                gap: "32px",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              {/* Left side - Treemap */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#F9FAFB",
                    margin: "0 0 16px 0",
                    textAlign: "center",
                    letterSpacing: "-0.01em",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  Top 20 Mindshare Contributors
                </h2>
                <Treemap
                  data={mindshareData}
                  width={560} // Adjusted for left side
                  height={390}
                />
              </div>

              <div
                style={{
                  width: "2px",
                  height: "100%",
                  backgroundColor: "#374151",
                  marginLeft: "32px",
                }}
              />
              {/* Right side - Top 5 Users List */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#F9FAFB",
                    margin: "0 0 16px 0",
                    textAlign: "center",
                    letterSpacing: "-0.01em",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  Top 5 Contributors
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    width: "100%",
                  }}
                >
                  {mindshareData.slice(0, 5).map((user: any, index: number) => (
                    <div
                      key={user.author_handle}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      {/* Rank */}
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor:
                            index === 0
                              ? "#FFD700"
                              : index === 1
                              ? "#C0C0C0"
                              : index === 2
                              ? "#CD7F32"
                              : "#00D992",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "15px",
                          fontWeight: "800",
                          color: "#000",
                          flexShrink: 0,
                        }}
                      >
                        #{index + 1}
                      </div>

                      {/* Profile Image */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {user.user_info?.profile_image_url ? (
                          <img
                            src={user.user_info.profile_image_url}
                            alt={user.author_handle}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              backgroundColor: "#374151",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "16px",
                              color: "#9CA3AF",
                            }}
                          >
                            {user.author_handle.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "#F9FAFB",
                            letterSpacing: "0.01em",
                          }}
                        >
                          @{user.author_handle}
                        </span>
                        <span
                          style={{
                            fontSize: "15px",
                            color: "#00D992",
                            fontWeight: "600",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {user.mindshare_percent.toFixed(2)}% mindshare
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
              fontSize: "52px",
              fontWeight: "800",
              textAlign: "center",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
            }}
          >
            TrendSage Campaign
          </h1>
          <p
            style={{
              fontSize: "26px",
              color: "#9CA3AF",
              textAlign: "center",
              fontWeight: "500",
              letterSpacing: "0.01em",
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
