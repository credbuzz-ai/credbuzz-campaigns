import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
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

          {/* Main Content Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: referralCode ? "40px" : "48px",
              padding: "64px",
              width: "100%",
              height: "100%",
              position: "relative",
              zIndex: 1,
            }}
          >
            {referralCode ? (
              // Referral-specific content
              <>
                {/* Referral Header */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "32px",
                      color: "#00D992",
                      fontWeight: "500",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Special Invitation
                  </div>
                  <h1
                    style={{
                      fontSize: "72px",
                      fontWeight: "bold",
                      background:
                        "linear-gradient(to bottom, #FFFFFF 0%, #E5E7EB 100%)",
                      backgroundClip: "text",
                      color: "transparent",
                      margin: 0,
                      lineHeight: 1.1,
                      textAlign: "center",
                      textShadow: "0 2px 10px rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    Join TrendSage
                  </h1>
                </div>

                {/* Referral Code Display */}
                <div
                  style={{
                    padding: "24px 48px",
                    background:
                      "linear-gradient(135deg, rgba(0, 217, 146, 0.15) 0%, rgba(0, 245, 168, 0.08) 100%)",
                    borderRadius: "20px",
                    border: "2px solid rgba(0, 217, 146, 0.3)",
                    boxShadow: "0 8px 32px rgba(0, 217, 146, 0.15)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "36px",
                      background: "linear-gradient(to right, #00D992, #00F5A8)",
                      backgroundClip: "text",
                      color: "transparent",
                      fontWeight: "600",
                      textShadow: "0 2px 10px rgba(0, 217, 146, 0.2)",
                    }}
                  >
                    Referral Code: {referralCode}
                  </span>
                </div>

                {/* Benefits */}
                <div
                  style={{
                    display: "flex",
                    gap: "32px",
                    justifyContent: "center",
                    marginTop: "16px",
                  }}
                >
                  {["Early Access", "Special Rewards", "Premium Features"].map(
                    (benefit, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "16px 32px",
                          background:
                            "linear-gradient(180deg, rgba(17, 24, 39, 0.8) 0%, rgba(17, 24, 39, 0.4) 100%)",
                          borderRadius: "16px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(to right, #00D992, #00F5A8)",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "24px",
                            color: "#D1D5DB",
                            fontWeight: "500",
                          }}
                        >
                          {benefit}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              // Regular landing page content
              <>
                {/* Title Section */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "24px",
                  }}
                >
                  <h1
                    style={{
                      fontSize: "80px",
                      fontWeight: "bold",
                      background:
                        "linear-gradient(to bottom, #FFFFFF 0%, #E5E7EB 100%)",
                      backgroundClip: "text",
                      color: "transparent",
                      margin: 0,
                      lineHeight: 1.1,
                      textAlign: "center",
                      textShadow: "0 2px 10px rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    The Future of
                    <span
                      style={{
                        display: "block",
                        background:
                          "linear-gradient(to right, #00D992, #00F5A8)",
                        backgroundClip: "text",
                        color: "transparent",
                        textShadow: "0 2px 10px rgba(0, 217, 146, 0.2)",
                      }}
                    >
                      Web3 Influence
                    </span>
                  </h1>
                  <p
                    style={{
                      fontSize: "24px",
                      color: "#9CA3AF",
                      textAlign: "center",
                      maxWidth: "800px",
                      margin: 0,
                      lineHeight: 1.5,
                      textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    AI-powered decentralized marketplace connecting brands with
                    authentic web3 Key Opinion Leaders
                  </p>
                </div>

                {/* Stats Container */}
                <div
                  style={{
                    display: "flex",
                    gap: "64px",
                    padding: "32px",
                    background:
                      "linear-gradient(180deg, rgba(17, 24, 39, 0.8) 0%, rgba(17, 24, 39, 0.4) 100%)",
                    borderRadius: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {[
                    { value: "10K+", label: "Verified KOLs" },
                    { value: "500+", label: "Active Campaigns" },
                    { value: "98%", label: "Success Rate" },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        padding: "0 24px",
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "56px",
                          fontWeight: "bold",
                          background:
                            "linear-gradient(to bottom, #00D992 0%, #00A97F 100%)",
                          backgroundClip: "text",
                          color: "transparent",
                          textShadow: "0 2px 10px rgba(0, 217, 146, 0.2)",
                        }}
                      >
                        {stat.value}
                      </span>
                      <span
                        style={{
                          fontSize: "20px",
                          color: "#D1D5DB",
                          fontWeight: "500",
                        }}
                      >
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
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

    // Return a fallback image with enhanced design
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
              textShadow: "0 2px 10px rgba(0, 217, 146, 0.2)",
            }}
          >
            TrendSage
          </h1>
          <p
            style={{
              fontSize: "28px",
              color: "#D1D5DB",
              textAlign: "center",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
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
