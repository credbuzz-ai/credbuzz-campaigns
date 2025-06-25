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
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-100 mb-6">
              The Future of
              <span className="block bg-gradient-to-r from-[#00D992] to-[#00F5A8] bg-clip-text text-transparent">
                Web3 Influence
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              AI-powered decentralized marketplace connecting brands with
              authentic web3 Key Opinion Leaders. Build trust, drive engagement,
              and scale your campaigns with blockchain transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/buzz-board"
                className="btn-primary inline-flex items-center"
              >
                Explore Campaigns <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                href="/kols"
                className="btn-secondary inline-flex items-center"
              >
                View KOL Profiles
              </Link>
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

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-[#00D992] mb-2 group-hover:scale-110 transition-transform">
                10K+
              </div>
              <div className="text-gray-300">Verified KOLs</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-[#00D992] mb-2 group-hover:scale-110 transition-transform">
                500+
              </div>
              <div className="text-gray-300">Active Campaigns</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-[#00D992] mb-2 group-hover:scale-110 transition-transform">
                $50M+
              </div>
              <div className="text-gray-300">Campaign Value</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-[#00D992] mb-2 group-hover:scale-110 transition-transform">
                98%
              </div>
              <div className="text-gray-300">Success Rate</div>
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
            <Link href="/buzz-board" className="btn-primary">
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
