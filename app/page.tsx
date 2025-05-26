import Link from "next/link"
import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              The Future of
              <span className="block bg-gradient-to-r from-pastel-mint to-pastel-lavender dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Web3 Influence
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              AI-powered decentralized marketplace connecting brands with authentic web3 Key Opinion Leaders. Build
              trust, drive engagement, and scale your campaigns with blockchain transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/buzz-board" className="btn-primary inline-flex items-center">
                Explore Campaigns <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link href="/profiles" className="btn-secondary inline-flex items-center">
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
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Revolutionizing Influencer Marketing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powered by AI and secured by blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-pastel bg-pastel-beige">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-gray-800" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">AI-Powered Matching</h3>
              <p className="text-gray-700 dark:text-gray-200">
                Our advanced AI algorithms analyze audience demographics, engagement patterns, and brand alignment to
                find the perfect KOL matches for your campaigns.
              </p>
            </div>

            <div className="card-pastel bg-pastel-mint">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-gray-800" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Blockchain Transparency</h3>
              <p className="text-gray-700 dark:text-gray-200">
                All transactions, metrics, and campaign results are recorded on-chain, ensuring complete transparency
                and trust between brands and influencers.
              </p>
            </div>

            <div className="card-pastel bg-pastel-lavender">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-gray-800" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Real-time Analytics</h3>
              <p className="text-gray-700 dark:text-gray-200">
                Track campaign performance with real-time analytics, engagement metrics, and ROI calculations powered by
                decentralized data oracles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">10K+</div>
              <div className="text-gray-600 dark:text-gray-300">Verified KOLs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Active Campaigns</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">$50M+</div>
              <div className="text-gray-600 dark:text-gray-300">Campaign Value</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">98%</div>
              <div className="text-gray-600 dark:text-gray-300">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Ready to Transform Your Marketing?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join the future of influencer marketing with CredBuzz
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">Start Your Campaign</button>
            <button className="btn-secondary">Become a KOL</button>
          </div>
        </div>
      </section>
    </div>
  )
}
