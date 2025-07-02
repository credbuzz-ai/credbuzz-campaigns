import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "TrendSage";
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
          {/* Content Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              position: "relative",
              zIndex: 1,
              background: "#000000",
            }}
          >
            {/* Main Content Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "32px 64px",
                flex: 1,
                gap: "16px",
              }}
            >
              {/* Left Section - Text and Logo */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: "54px",
                    color: "white",
                    margin: 0,
                    fontWeight: "400",
                    textAlign: "left",
                    display: "flex",
                    flexWrap: "wrap",
                  }}
                >
                  {name} Invited you <br />
                  to join TrendSage
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
                      fontSize: "40px",
                      color: "white",
                      margin: 0,
                      fontWeight: "400",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    Create buzz on
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      fill="#FFFFFF"
                      viewBox="0 0 256 256"
                    >
                      <path d="M214.75,211.71l-62.6-98.38,61.77-67.95a8,8,0,0,0-11.84-10.76L143.24,99.34,102.75,35.71A8,8,0,0,0,96,32H48a8,8,0,0,0-6.75,12.3l62.6,98.37-61.77,68a8,8,0,1,0,11.84,10.76l58.84-64.72,40.49,63.63A8,8,0,0,0,160,224h48a8,8,0,0,0,6.75-12.29ZM164.39,208,62.57,48h29L193.43,208Z"></path>
                    </svg>
                    & Earn Rewards
                  </span>
                </div>
              </div>

              {/* Right Section - Profile */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    style={{
                      width: "220px",
                      height: "220px",
                      borderRadius: "16px",
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
                      width: "160px",
                      height: "160px",
                      borderRadius: "16px",
                      background: "#00D992",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "80px",
                      fontWeight: "bold",
                      color: "#000",
                    }}
                  >
                    {name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row - CTA */}
            <div
              style={{
                display: "flex",
                background: "#00D992",
                color: "#000",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                width: "100%",
              }}
            >
              <p style={{ fontSize: "40px", fontWeight: "900", margin: 0 }}>
                Claim Your 10 SAGE →
              </p>
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
