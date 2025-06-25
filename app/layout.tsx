import PrivyProvider from "@/components/PrivyProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { UserProvider } from "@/contexts/UserContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Generate metadata with dynamic OG image URL based on referral code
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { referral_code?: string };
}): Promise<Metadata> {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://trendsage.xyz";
  const ogImageUrl = searchParams?.referral_code
    ? `${domain}/api/og?referral_code=${searchParams.referral_code}`
    : `${domain}/api/og`;

  return {
    title: {
      default: "TrendSage - Web3 KOL Marketplace",
      template: "%s | TrendSage",
    },
    description:
      "AI-powered decentralized marketplace connecting brands with authentic web3 Key Opinion Leaders. Build trust, drive engagement, and scale your campaigns with blockchain transparency.",
    keywords:
      "Web3, KOL, Influencer Marketing, Crypto, Blockchain, Decentralized, AI, Campaign Management",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: searchParams?.referral_code
        ? `${domain}?referral_code=${searchParams.referral_code}`
        : domain,
      title: "TrendSage - Web3 KOL Marketplace",
      description:
        "AI-powered decentralized marketplace connecting brands with authentic web3 Key Opinion Leaders. Build trust, drive engagement, and scale your campaigns with blockchain transparency.",
      siteName: "TrendSage - Web3 KOL Marketplace",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "TrendSage - Web3 KOL Marketplace",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "TrendSage - Web3 KOL Marketplace",
      description:
        "AI-powered decentralized marketplace connecting brands with authentic web3 Key Opinion Leaders.",
      creator: "@0xtrendsage",
      site: "@0xtrendsage",
      images: [ogImageUrl],
    },
    generator: "Next.js",
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/logo-green.svg",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <PrivyProvider>
            <UserProvider>{children}</UserProvider>
          </PrivyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
