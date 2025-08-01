import OpenCampaigns from "@/app/components/OpenCampaigns";
import ReferralHandler from "@/app/components/ReferralHandler";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

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

          {/* Key Metrics */}
          {/* <div className="mt-16 max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 text-center border border-neutral-600 border-dashed divide-x divide-y divide-neutral-600 divide-dashed">
              <div className="py-4 md:py-8 px-6 flex flex-col gap-1">
                <span className="text-lg md:text-xl font-semibold text-brand-50">
                  10K+
                </span>
                <span className="text-neutral-300 text-sm md:text-base">
                  Reward pool
                </span>
              </div>
              <div className="py-4 md:py-8 px-6 flex flex-col gap-1">
                <span className="text-lg md:text-xl font-semibold text-brand-50">
                  3+
                </span>
                <span className="text-neutral-300 text-sm md:text-base">
                  Active Campaigns
                </span>
              </div>
              <div className="py-4 md:py-8 px-6 flex flex-col gap-1">
                <span className="text-lg md:text-xl font-semibold text-brand-50">
                  $50M+
                </span>
                <span className="text-neutral-300 text-sm md:text-base">
                  Campaign value
                </span>
              </div>
              <div className="py-4 md:py-8 px-6 flex flex-col gap-1">
                <span className="text-lg md:text-xl font-semibold text-brand-50">
                  98%
                </span>
                <span className="text-neutral-300 text-sm md:text-base">
                  Success Rate
                </span>
              </div>
            </div>
          </div> */}
        </div>
      </section>
      {/* Open Campaigns Section */}
      <OpenCampaigns />

      {/* Features Section */}
      {/* <section className="py-20 px-4 sm:px-6 lg:px-8">
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
      </section> */}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        {/* CTA Buttons */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-100 mb-6">
            Ready to Transform Your Marketing?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the future of influencer marketing with TrendSage
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="https://t.me/basetillmoon"
              target="_blank"
              className="btn-primarynew inline-flex items-center justify-center "
            >
              Contact Us <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            {/* <Link
              href="/sage-campaigns"
              className="btn-primarynew inline-flex items-center justify-center "
            >
              Explore campaigns <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              href="/kols"
              className="btn-secondarynew inline-flex items-center justify-center"
            >
              Find top KOLs
            </Link> */}
          </div>
        </div>
      </section>
      {/* Backed b¥ */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div
              className="bg-neutral-700 rounded-lg text-center relative overflow-hidden min-h-[120px] md:min-h-[160px]"
              style={{
                backgroundImage: "url('/decor.png')",
                backgroundSize: "cover",
                backgroundPosition: "center top",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="relative z-10 p-6 md:p-8 flex flex-col items-center justify-center h-full">
                <p className="text-neutral-200 text-xl md:text-2xl font-medium mb-4">
                  Winners of
                </p>
                <div className="flex items-center justify-center gap-4 md:gap-6">
                  <img
                    src="/ethSf.png"
                    alt="ETH San Francisco"
                    className="h-8 md:h-10 lg:h-12 w-auto object-contain"
                  />
                  <img
                    src="/baseBatch.png"
                    alt="Base Batch"
                    className="h-8 md:h-10 lg:h-12 w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            <div
              className="bg-neutral-700 rounded-lg text-center relative overflow-hidden min-h-[120px] md:min-h-[160px]"
              style={{
                backgroundImage: "url('/decor.png')",
                backgroundSize: "cover",
                backgroundPosition: "center top",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="relative z-10 p-6 md:p-8 flex flex-col items-center justify-center h-full">
                <p className="text-neutral-200 text-xl md:text-2xl font-medium mb-4">
                  Incubased at
                </p>
                <div className="flex items-center justify-center gap-4 md:gap-6">
                  <img
                    src="/base.svg"
                    alt="Base"
                    className="h-8 md:h-10 lg:h-12 w-auto object-contain"
                  />
                  <img
                    src="/odisea.svg"
                    alt="Odisea"
                    className="h-8 md:h-10 lg:h-12 w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
