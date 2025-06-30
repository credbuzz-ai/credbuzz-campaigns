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
          {/* Background Image */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MjgiIHZpZXdCb3g9IjAgMCAxMjAwIDYyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iYmx1ckdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwMDAwMDtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMTExODI3O3N0b3Atb3BhY2l0eToxIiAvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjYyOCIgZmlsbD0idXJsKCNibHVyR3JhZGllbnQpIi8+Cjwvc3ZnPgo=)",
              backgroundSize: "cover",
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
                      borderRadius: "48px",
                      objectFit: "cover",
                    }}
                    alt="Profile"
                  />
                ) : (
                  <div
                    style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "48px",
                      background: "#00D992",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "40px",
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
                      fontSize: "40px",
                      color: "white",
                      margin: 0,
                      fontWeight: "400",
                    }}
                  >
                    {name}
                  </h2>
                  <p
                    style={{
                      fontSize: "28px",
                      color: "#9CA3AF",
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
                      fontSize: "24px",
                      color: "#9CA3AF",
                      margin: 0,
                      marginBottom: "8px",
                    }}
                  >
                    Followers
                  </h3>
                  <p
                    style={{
                      fontSize: "40px",
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
                      fontSize: "24px",
                      color: "#9CA3AF",
                      margin: 0,
                      marginBottom: "8px",
                    }}
                  >
                    Rewards
                  </h3>
                  <p
                    style={{
                      fontSize: "40px",
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
                alignItems: "center",
                gap: "24px",
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
                }}
              >
                Turn your Popularity on X into
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <span
                  style={{
                    fontSize: "48px",
                    color: "white",
                    margin: 0,
                    fontWeight: "400",
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
                  color: "#9CA3AF",
                  margin: 0,
                }}
              >
                Use my referral URL now!
              </p>
              <div
                style={{
                  background: "#00D992",
                  color: "#000",
                  padding: "16px 32px",
                  borderRadius: "12px",
                  fontSize: "32px",
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