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
                "radial-gradient(circle at 25px 25px, rgba(0, 217, 146, 0.05) 2px, transparent 0), radial-gradient(circle at 75px 75px, rgba(0, 217, 146, 0.03) 2px, transparent 0)",
              backgroundSize: "100px 100px",
              opacity: 0.5,
            }}
          />

          {/* Glow Effects */}
          <div
            style={{
              position: "absolute",
              top: "-20%",
              left: "-10%",
              width: "40%",
              height: "40%",
              background:
                "radial-gradient(circle, rgba(0, 217, 146, 0.15) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-20%",
              right: "-10%",
              width: "40%",
              height: "40%",
              background:
                "radial-gradient(circle, rgba(0, 217, 146, 0.15) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />

          {/* Main Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "32px",
              maxWidth: "90%",
              zIndex: 1,
            }}
          >
            {/* Title */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <h1
                style={{
                  fontSize: "72px",
                  fontWeight: "bold",
                  color: "#FFFFFF",
                  margin: 0,
                  lineHeight: 1.2,
                  textAlign: "center",
                  letterSpacing: "-0.02em",
                }}
              >
                Unlock Your Web3
                <span
                  style={{
                    background: "linear-gradient(to right, #00D992, #00F5A8)",
                    backgroundClip: "text",
                    color: "transparent",
                    marginLeft: "12px",
                  }}
                >
                  Influence
                </span>
              </h1>
              <p
                style={{
                  fontSize: "28px",
                  color: "#9CA3AF",
                  textAlign: "center",
                  margin: 0,
                  lineHeight: 1.5,
                  maxWidth: "80%",
                  marginTop: "16px",
                }}
              >
                Turn Your Crypto Knowledge Into Rewards
              </p>
            </div>

            {/* Rewards Section */}
            {!referralCode && (
              <div
                style={{
                  gap: "24px",
                  padding: "32px 48px",
                  background:
                    "linear-gradient(180deg, rgba(17, 24, 39, 0.8) 0%, rgba(17, 24, 39, 0.4) 100%)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "36px",
                    color: "#00D992",
                    fontWeight: "600",
                    textAlign: "center",
                    marginBottom: "8px",
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
                          padding: "12px 24px",
                          background: "rgba(0, 217, 146, 0.1)",
                          borderRadius: "12px",
                          border: "1px solid rgba(0, 217, 146, 0.2)",
                        }}
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#00D992",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "20px",
                            color: "#E5E7EB",
                            fontWeight: "500",
                          }}
                        >
                          {benefit}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Referral Code */}
            {referralCode && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "24px",
                  width: "100%",
                  maxWidth: "100%",
                  background:
                    "linear-gradient(180deg, rgba(17, 24, 39, 0.9) 0%, rgba(17, 24, 39, 0.6) 100%)",
                  borderRadius: "24px",
                  border: "1px solid rgba(0, 217, 146, 0.2)",
                  padding: "40px",
                  boxShadow: "0 0 40px rgba(0, 217, 146, 0.1)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Background Glow */}
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
                    filter: "blur(40px)",
                    zIndex: 0,
                  }}
                />

                <div
                  style={{
                    fontSize: "32px",
                    color: "#F3F4F6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    zIndex: 1,
                  }}
                >
                  <span style={{ color: "#00D992" }}>🎁</span>
                  Your Exclusive Invite
                </div>

                <div
                  style={{
                    padding: "24px 48px",
                    background:
                      "linear-gradient(135deg, rgba(0, 217, 146, 0.2) 0%, rgba(0, 245, 168, 0.1) 100%)",
                    borderRadius: "16px",
                    border: "2px solid rgba(0, 217, 146, 0.4)",
                    boxShadow: "0 0 30px rgba(0, 217, 146, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: "48px",
                      background: "linear-gradient(to right, #00D992, #00F5A8)",
                      backgroundClip: "text",
                      color: "transparent",
                      fontWeight: "700",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {referralCode}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: "24px",
                      color: "#F3F4F6",
                      fontWeight: "500",
                    }}
                  >
                    Join The Top 1% of Web3 KOLs
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      color: "#00D992",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>⚡️</span>
                    Limited Time Early Access
                  </div>
                </div>
              </div>
            )}
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
            background: "linear-gradient(135deg, #0A0F1A 0%, #111827 100%)",
            padding: "48px",
          }}
        >
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              background: "linear-gradient(to right, #00D992, #00F5A8)",
              backgroundClip: "text",
              color: "transparent",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            TrendSage
          </h1>
          <p
            style={{
              fontSize: "28px",
              color: "#D1D5DB",
              textAlign: "center",
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
