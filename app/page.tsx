import OpenCampaigns from "@/app/components/OpenCampaigns";
import ReferralHandler from "@/app/components/ReferralHandler";
import { ArrowRight } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "TrendSage - Web3 KOL Marketplace | Decentralized Influencer Platform",
  description:
    "AI-powered decentralized marketplace connecting brands with authentic web3 Key Opinion Leaders. Build trust, drive engagement, and scale your campaigns with blockchain transparency.",
  keywords:
    "Web3 Marketing, KOL Platform, Influencer Marketing, Crypto Marketing, Blockchain Marketing, Web3 KOL, Decentralized Marketing",
  openGraph: {
    title: "TrendSage - Web3 KOL Marketplace",
    description:
      "AI-powered decentralized marketplace connecting brands with authentic web3 Key Opinion Leaders.",
    type: "website",
    siteName: "TrendSage",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrendSage - Web3 KOL Marketplace",
    description: "AI-powered decentralized marketplace for Web3 KOLs",
    creator: "@0xtrendsage",
    site: "@0xtrendsage",
  },
  alternates: {
    canonical: "https://trendsage.xyz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Background Image */}
      <div className="pointer-events-none select-none absolute inset-0 -z-10 bg-[url('/landingPageBg.png')] bg-cover bg-center opacity-40" />

      <Suspense fallback={null}>
        <ReferralHandler />
      </Suspense>

      {/* Hero Section */}
      <section className="relative pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Centered Logo */}
          <Link
            href="/"
            className="flex items-center justify-center mb-12 select-none "
          >
            <img
              src="/logo-green.svg"
              alt="TrendSage"
              className="w-8 h-8 md:w-10 md:h-10 mr-2"
            />
            <span className="text-xl md:text-2xl font-semibold text-neutral-100">
              TrendSage
            </span>
          </Link>

          {/* Main Heading */}
          <h1 className="text-[32px] md:text-3xl lg:text-5xl font-semibold text-neutral-100 leading-tight mb-6">
            The Future of Web3 Influence
          </h1>

          {/* Sub-heading */}
          <p className="hidden md:block text-lg md:text-xl text-neutral-300 mb-10 max-w-3xl mx-auto">
            AI-powered decentralized marketplace connecting brands with
            authentic Web3 Key Opinion Leaders. Build trust, drive engagement,
            and scale your campaigns with blockchain transparency.
          </p>
          <p className="block md:hidden text-lg md:text-xl text-neutral-300 mb-10 max-w-3xl mx-auto">
            AI-powered decentralized marketplace connecting brands with
            authentic Web3 KOLs.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/kols"
              className="btn-secondarynew inline-flex items-center justify-center"
            >
              Find top KOLs
            </Link>
            <Link
              href="/sage-campaigns"
              className="btn-primarynew inline-flex items-center justify-center "
            >
              Explore campaigns <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Open Campaigns Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-100 mb-8 text-center">
            Active Campaigns
          </h2>
          <OpenCampaigns />
        </div>
      </section>
    </div>
  );
}
