import ReferralHandler from "@/app/components/ReferralHandler";
import { ArrowRight, Shield, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Suspense fallback={null}>
        <ReferralHandler />
      </Suspense>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-800 via-neutral-800/95 to-neutral-800/75">
        <div className="max-w-4xl mx-auto text-center">
          {/* Centered Logo */}
          <Link
            href="/"
            className="inline-flex items-center justify-center mb-12 select-none"
          >
            <img
              src="/logo-green.svg"
              alt="TrendSage"
              className="w-8 h-8 md:w-10 md:h-10 mr-2"
            />
            <span className="text-lg md:text-2xl font-semibold text-neutral-100">
              TrendSage
            </span>
          </Link>

          {/* Main Heading */}
          <h1 className="text-2xl md:text-3xl lg:text-5xl font-semibold text-neutral-100 leading-tight mb-6">
            The Future of Web3 Influence
          </h1>

          {/* Sub-heading */}
          <p className="text-lg md:text-xl text-neutral-300 mb-10 max-w-3xl mx-auto">
            AI-powered decentralized marketplace connecting brands with
            authentic Web3 Key Opinion Leaders. Build trust, drive engagement,
            and scale your campaigns with blockchain transparency.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kols"
              className="btn-secondarynew inline-flex items-center justify-center min-w-[160px]"
            >
              Find top KOLs
            </Link>
            <Link
              href="/sage-campaigns"
              className="btn-primarynew inline-flex items-center justify-center min-w-[160px]"
            >
              Explore campaigns <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {/* Key Metrics */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 text-center border border-neutral-600 border-dashed">
              {/* 10K+ */}
              <div className="py-8 px-6 flex flex-col gap-1 border-neutral-600 border-dashed md:border-r last:md:border-none">
                <span className="text-lg md:text-xl font-semibold text-brand-50">
                  10K+
                </span>
                <span className="text-neutral-300 text-sm md:text-base">
                  Reward pool
                </span>
              </div>
              {/* 500+ */}
              <div className="py-8 px-6 flex flex-col gap-1 border-neutral-600 border-dashed md:border-r last:md:border-none">
                <span className="text-lg md:text-xl font-semibold text-brand-50">
                  500+
                </span>
                <span className="text-neutral-300 text-sm md:text-base">
                  Active Campaigns
                </span>
              </div>
              {/* $50M+ */}
              <div className="py-8 px-6 flex flex-col gap-1 border-neutral-600 border-dashed md:border-r last:md:border-none">
                <span className="text-lg md:text-xl font-semibold text-brand-50">
                  $50M+
                </span>
                <span className="text-neutral-300 text-sm md:text-base">
                  Campaign value
                </span>
              </div>
              {/* 98% */}
              <div className="py-8 px-6 flex flex-col gap-1">
                <span className="text-lg md:text-xl font-semibold text-brand-50">
                  98%
                </span>
                <span className="text-neutral-300 text-sm md:text-base">
                  Success Rate
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              Revolutionizing Influencer Marketing
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powered by AI and secured by blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-trendsage group">
              <div className="w-12 h-12 bg-[#00D992] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-4">
                AI-Powered Matching
              </h3>
              <p className="text-gray-300">
                Our advanced AI algorithms analyze audience demographics,
                engagement patterns, and brand alignment to find the perfect KOL
                matches for your campaigns.
              </p>
            </div>

            <div className="card-trendsage group">
              <div className="w-12 h-12 bg-[#00D992] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-4">
                Blockchain Transparency
              </h3>
              <p className="text-gray-300">
                All transactions, metrics, and campaign results are recorded
                on-chain, ensuring complete transparency and trust between
                brands and influencers.
              </p>
            </div>

            <div className="card-trendsage group">
              <div className="w-12 h-12 bg-[#00D992] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-4">
                Real-time Analytics
              </h3>
              <p className="text-gray-300">
                Track campaign performance with real-time analytics, engagement
                metrics, and ROI calculations powered by decentralized data
                oracles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-100 mb-6">
            Ready to Transform Your Marketing?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the future of influencer marketing with TrendSage
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sage-campaigns" className="btn-primary">
              Start Your Campaign
            </Link>
            <Link href="/kols" className="btn-secondary">
              Become a KOL
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
