import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

// Enable caching for OG images
export const revalidate = 3600; // Cache for 1 hour

const API_BASE_URL =
  process.env.NEXT_PUBLIC_TRENDSAGE_API_URL ||
  process.env.NEXT_PUBLIC_CREDBUZZ_API_URL ||
  "https://api.cred.buzz";

export async function GET(request: NextRequest) {
  try {
    // Get referral code from URL
    const { searchParams } = new URL(request.url);
    const referralCode = searchParams.get("referral_code");
    let name = searchParams.get("name");
    let profile_image_url = searchParams.get("profile_image_url");

    // Set cache control headers
    const headers = new Headers();
    headers.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
    );

    if (!name && !profile_image_url) {
      const userData = await fetch(
        `${API_BASE_URL}/user/get-referral-card-info?referral_code=${referralCode}`
      );
      const user = await userData.json();
      name = user.result.name;
      profile_image_url = user.result.profile_image_url;
    }

    // Create the Open Graph image
    const imageResponse = new ImageResponse(
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
                {profile_image_url ? (
                  <img
                    src={profile_image_url}
                    style={{
                      width: "220px",
                      height: "220px",
                      borderRadius: "16px",
                      objectFit: "cover",
                    }}
                    alt="Profile"
                    crossOrigin={
                      profile_image_url.startsWith("http")
                        ? "anonymous"
                        : undefined
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
                    {name?.substring(0, 2).toUpperCase()}
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
        height: 630,
      }
    );

    // Copy the headers from the ImageResponse and add our cache headers
    const finalHeaders = new Headers(imageResponse.headers);
    finalHeaders.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
    );

    // Return a new Response with the same body but updated headers
    return new Response(imageResponse.body, {
      status: imageResponse.status,
      headers: finalHeaders,
    });
  } catch (error) {
    console.error("Failed to generate OG image:", error);

    // Set cache headers for the fallback image too
    const headers = new Headers();
    headers.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
    );

    // Return a fallback image with the same polished design
    const fallbackResponse = new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0A0F1A 0%, #111827 100%)",
            position: "relative",
            overflow: "hidden",
            padding: "40px",
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage:
                "radial-gradient(circle at 25px 25px, rgba(0, 217, 146, 0.08) 2px, transparent 0), radial-gradient(circle at 75px 75px, rgba(0, 217, 146, 0.05) 2px, transparent 0)",
              backgroundSize: "100px 100px",
              opacity: 0.7,
            }}
          />

          {/* Glow Effects */}
          <div
            style={{
              position: "absolute",
              top: "-10%",
              left: "-5%",
              width: "50%",
              height: "50%",
              background:
                "radial-gradient(circle, rgba(0, 217, 146, 0.2) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-10%",
              right: "-5%",
              width: "50%",
              height: "50%",
              background:
                "radial-gradient(circle, rgba(0, 217, 146, 0.2) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />

          {/* Main Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "40px",
              maxWidth: "90%",
              zIndex: 1,
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                marginBottom: "8px",
                filter: "drop-shadow(0 8px 16px rgba(0, 217, 146, 0.2))",
              }}
            >
              <svg
                width="96"
                height="96"
                viewBox="0 0 349 348"
                fill="none"
                style={{
                  borderRadius: "24px",
                  filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))",
                }}
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
                  background:
                    "linear-gradient(135deg, #00D992 0%, #00F5A8 100%)",
                  backgroundClip: "text",
                  color: "transparent",
                  fontWeight: "800",
                  letterSpacing: "-0.02em",
                  filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                }}
              >
                TrendSage
              </span>
            </div>

            {/* Title */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <h1
                style={{
                  fontSize: "72px",
                  fontWeight: "800",
                  color: "#FFFFFF",
                  margin: 0,
                  lineHeight: 1.1,
                  textAlign: "center",
                  letterSpacing: "-0.02em",
                  filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))",
                }}
              >
                Unlock Your Web3
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #00D992 0%, #00F5A8 100%)",
                    backgroundClip: "text",
                    color: "transparent",
                    marginLeft: "12px",
                    filter: "drop-shadow(0 2px 4px rgba(0, 217, 146, 0.2))",
                  }}
                >
                  Influence
                </span>
              </h1>
              <p
                style={{
                  fontSize: "32px",
                  color: "#9CA3AF",
                  textAlign: "center",
                  margin: 0,
                  lineHeight: 1.4,
                  maxWidth: "80%",
                  opacity: 0.9,
                  filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                }}
              >
                Turn Your Crypto Knowledge Into Rewards
              </p>
            </div>

            {/* Rewards Section */}
            <div
              style={{
                gap: "24px",
                padding: "40px 48px",
                background:
                  "linear-gradient(180deg, rgba(17, 24, 39, 0.9) 0%, rgba(17, 24, 39, 0.7) 100%)",
                borderRadius: "24px",
                border: "1px solid rgba(0, 217, 146, 0.2)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                style={{
                  fontSize: "36px",
                  color: "#00D992",
                  fontWeight: "700",
                  textAlign: "center",
                  marginBottom: "16px",
                  filter: "drop-shadow(0 2px 4px rgba(0, 217, 146, 0.2))",
                }}
              >
                💎 Exclusive Benefits
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "32px",
                  justifyContent: "center",
                }}
              >
                {["Early Access", "Token Rewards", "Premium Campaigns"].map(
                  (benefit, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "16px 28px",
                        background: "rgba(0, 217, 146, 0.1)",
                        borderRadius: "16px",
                        border: "1px solid rgba(0, 217, 146, 0.3)",
                        boxShadow: "0 4px 12px rgba(0, 217, 146, 0.1)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #00D992 0%, #00F5A8 100%)",
                          boxShadow: "0 0 8px rgba(0, 217, 146, 0.4)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "20px",
                          color: "#F3F4F6",
                          fontWeight: "600",
                          filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                        }}
                      >
                        {benefit}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    // Copy the headers from the fallback ImageResponse and add our cache headers
    const finalHeaders = new Headers(fallbackResponse.headers);
    finalHeaders.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
    );

    return new Response(fallbackResponse.body, {
      status: fallbackResponse.status,
      headers: finalHeaders,
    });
  }
}
