import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "TrendSage";
    const handle = searchParams.get("handle") || "0xtrendsage";
    const followers = searchParams.get("followers") || "0";
    const rewards = searchParams.get("rewards") || "0";
    const profileImage = searchParams.get("profileImage") || "";

    // Build absolute URLs for public assets so they can be fetched in the Edge runtime
    const baseUrl = new URL(request.url).origin;
    const blurImageUrl = `${baseUrl}/blur.png`;
    const earnImageUrl = `${baseUrl}/earn.png`;

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "628px",
            display: "flex",
            flexDirection: "column",
            background: "#000000",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background Image with Blur */}
          <img
            src={blurImageUrl}
            alt="Background"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Content Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              padding: "48px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Top Row - Profile Info */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Profile Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "12px",
                      objectFit: "cover",
                    }}
                    alt="Profile"
                    crossOrigin={
                      profileImage.startsWith("http") ? "anonymous" : undefined
                    }
                  />
                ) : (
                  <div
                    style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "12px",
                      background: "#00D992",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "60px",
                      fontWeight: "bold",
                      color: "#000",
                    }}
                  >
                    {name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h2
                    style={{
                      fontSize: "56px",
                      color: "#DFFCF6",
                      margin: 0,
                      fontWeight: "400",
                    }}
                  >
                    {name}
                  </h2>
                  <p
                    style={{
                      fontSize: "30px",
                      color: "#A9F0DF",
                      margin: 0,
                      marginTop: "8px",
                    }}
                  >
                    @{handle}
                  </p>
                </div>
              </div>

              {/* Stats Section */}
              <div
                style={{
                  display: "flex",
                  gap: "96px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "36px",
                      color: "#9CA3AF",
                      margin: 0,
                      marginBottom: "8px",
                    }}
                  >
                    Followers
                  </h3>
                  <p
                    style={{
                      fontSize: "42px",
                      color: "white",
                      margin: 0,
                      fontWeight: "400",
                    }}
                  >
                    {followers}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "36px",
                      color: "#9CA3AF",
                      margin: 0,
                      marginBottom: "8px",
                    }}
                  >
                    Rewards
                  </h3>
                  <p
                    style={{
                      fontSize: "42px",
                      color: "white",
                      margin: 0,
                      fontWeight: "400",
                    }}
                  >
                    {rewards} SAGE
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Row - Main Message */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "16px",
                padding: "32px 0",
                borderTop: "2px dashed #374151",
                borderBottom: "2px dashed #374151",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  color: "white",
                  margin: 0,
                  fontWeight: "400",
                  textAlign: "left",
                }}
              >
                Turn your Popularity on X into
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontSize: "48px",
                    color: "white",
                    margin: 0,
                    fontWeight: "400",
                    textAlign: "left",
                  }}
                >
                  Exciting Rewards with
                </span>
                {/* TrendSage Logo SVG */}
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 349 348"
                  fill="none"
                  style={{ margin: "0 8px" }}
                >
                  <rect width="348" height="348" rx="79" fill="#00D992" />
                  <path
                    d="M271.333 86V80.5C271.333 69.7 262.333 67 257.833 67H180.833C175.633 67 171.667 71.6054 170.333 73.9082L163.352 86L150.073 109C146.265 115.596 141.728 113 139.419 109L130.181 93C128.941 90.8514 127.203 89.3211 125.333 88.2509C122.331 86.5318 118.991 86 116.833 86H90.3335C80.8335 86 77.3335 95 77.3335 99V164V172.5C77.3335 176 81.0335 183 87.8335 183H107.349H125.333V267.5C125.333 273.5 127.433 281 137.833 281H215.833C222.333 281 233.527 272 225.733 258.5L182.143 183L176.333 172.938C174.349 169.5 174.833 164 180.833 164H259.833C264.333 164 271.333 160.1 271.333 152.5V86Z"
                    fill="#060F11"
                  />
                </svg>
                <span
                  style={{
                    fontSize: "48px",
                    color: "white",
                    margin: 0,
                    fontWeight: "400",
                  }}
                >
                  TrendSage
                </span>
              </div>
            </div>

            {/* Bottom Row - CTA */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontSize: "36px",
                  color: "#6A7B78",
                  margin: 0,
                }}
              >
                Here's a reward to start with
              </p>
              <div
                style={{
                  background: "#00D992",
                  color: "#000",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontSize: "36px",
                  fontWeight: "bold",
                }}
              >
                Claim Your 10 SAGE →
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 628,
      }
    );
  } catch (error) {
    console.error("Error generating social card:", error);
    return new Response("Failed to generate social card", { status: 500 });
  }
}
