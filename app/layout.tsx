import Header from "@/components/Header";
import PrivyProvider from "@/components/PrivyProvider";
import { Toaster } from "@/components/ui/toaster";
import { SignupProvider } from "@/contexts/CreatorSignupContext";
import { UserProvider } from "@/contexts/UserContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Generate metadata with dynamic OG image URL based on referral code
export async function generateMetadata({
  searchParams = {},
}: {
  searchParams?: { referral_code?: string };
} = {}): Promise<Metadata> {
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the OG image URL from middleware header or fallback to default
  const headersList = await headers();
  const ogImageUrl =
    headersList.get("x-og-image") ||
    `${process.env.NEXT_PUBLIC_APP_URL}/api/og`;

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo-green.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo-green.svg" />
        <meta property="og:title" content="TrendSage - Web3 KOL Marketplace" />
        <meta
          property="og:description"
          content="AI-powered decentralized marketplace connecting brands with authentic web3 Key Opinion Leaders."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <PrivyProvider>
          <UserProvider>
            <SignupProvider>
              <Header />
              <main>{children}</main>
              <Toaster />
            </SignupProvider>
          </UserProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
