import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_TRENDSAGE_API_URL ||
  process.env.NEXT_PUBLIC_CREDBUZZ_API_URL ||
  "https://api.cred.buzz";

export async function GET(request: NextRequest) {
  try {
    // Get referral code from URL
    const { searchParams } = new URL(request.url);
    const referralCode = searchParams.get("referral_code");

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

            {/* {referralCode && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "24px",
                  width: "100%",
                  maxWidth: "100%",
                  background:
                    "linear-gradient(180deg, rgba(17, 24, 39, 0.95) 0%, rgba(17, 24, 39, 0.8) 100%)",
                  borderRadius: "24px",
                  border: "1px solid rgba(0, 217, 146, 0.3)",
                  padding: "40px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  backdropFilter: "blur(20px)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "120%",
                    height: "120%",
                    background:
                      "radial-gradient(circle, rgba(0, 217, 146, 0.2) 0%, transparent 70%)",
                    filter: "blur(40px)",
                    zIndex: 0,
                  }}
                />

                <div
                  style={{
                    fontSize: "36px",
                    color: "#F3F4F6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    zIndex: 1,
                    fontWeight: "700",
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                  }}
                >
                  <span style={{ color: "#00D992" }}>🎁</span>
                  Your Exclusive Invite
                </div>

                <div
                  style={{
                    padding: "24px 48px",
                    background:
                      "linear-gradient(135deg, rgba(0, 217, 146, 0.15) 0%, rgba(0, 245, 168, 0.1) 100%)",
                    borderRadius: "20px",
                    border: "2px solid rgba(0, 217, 146, 0.4)",
                    boxShadow: "0 8px 32px rgba(0, 217, 146, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "48px",
                      background:
                        "linear-gradient(135deg, #00D992 0%, #00F5A8 100%)",
                      backgroundClip: "text",
                      color: "transparent",
                      fontWeight: "800",
                      letterSpacing: "0.02em",
                      filter: "drop-shadow(0 2px 4px rgba(0, 217, 146, 0.2))",
                    }}
                  >
                    {referralCode}
                  </span>
                </div>
              </div>
            )} */}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Failed to generate OG image:", error);

    // Return a fallback image with the same polished design
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
            background: "linear-gradient(135deg, #0A0F1A 0%, #111827 100%)",
            padding: "48px",
            position: "relative",
            overflow: "hidden",
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

          {/* Glow Effect */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "120%",
              height: "120%",
              background:
                "radial-gradient(circle, rgba(0, 217, 146, 0.15) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />

          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              marginBottom: "32px",
              filter: "drop-shadow(0 8px 16px rgba(0, 217, 146, 0.2))",
              zIndex: 1,
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
                background: "linear-gradient(135deg, #00D992 0%, #00F5A8 100%)",
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

          <h1
            style={{
              fontSize: "64px",
              fontWeight: "800",
              background: "linear-gradient(135deg, #00D992 0%, #00F5A8 100%)",
              backgroundClip: "text",
              color: "transparent",
              textAlign: "center",
              marginBottom: "24px",
              filter: "drop-shadow(0 4px 8px rgba(0, 217, 146, 0.2))",
              zIndex: 1,
            }}
          >
            Web3 KOL Marketplace
          </h1>
          <p
            style={{
              fontSize: "32px",
              color: "#D1D5DB",
              textAlign: "center",
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
              zIndex: 1,
            }}
          >
            Join & Earn Rewards
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
