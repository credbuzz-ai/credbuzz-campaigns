import { notFound } from "next/navigation"
import { Calendar, DollarSign, Users, Target, Clock, CheckCircle } from "lucide-react"

// Mock data
const campaigns = {
  "defi-summer-2024": {
    title: "DeFi Summer 2024 Campaign",
    brand: "Compound Finance",
    description:
      "Educate users about the latest DeFi innovations and drive adoption of Compound V3 protocol through authentic storytelling and educational content.",
    budget: "$50,000",
    duration: "30 days",
    startDate: "2024-06-01",
    endDate: "2024-06-30",
    status: "Active",
    participants: 12,
    targetReach: "500K",
    currentReach: "342K",
    requirements: [
      "Minimum 10K followers in crypto/DeFi space",
      "Previous DeFi campaign experience",
      "Authentic engagement (>5% rate)",
      "Content in English",
    ],
    deliverables: [
      "2 educational Twitter threads",
      "1 detailed blog post or video",
      "5 engagement posts",
      "Live AMA participation",
    ],
    kols: [
      { name: "Alex Chen", username: "@alexweb3", followers: "125K", status: "Confirmed" },
      { name: "Sarah DeFi", username: "@sarahdefi", followers: "89K", status: "Confirmed" },
      { name: "Mike Crypto", username: "@mikecrypto", followers: "156K", status: "Pending" },
    ],
  },
}

export default function CampaignPage({ params }: { params: { projectName: string } }) {
  const campaign = campaigns[params.projectName as keyof typeof campaigns]

  if (!campaign) {
    notFound()
  }

  const progress =
    (Number.parseInt(campaign.currentReach.replace("K", "")) / Number.parseInt(campaign.targetReach.replace("K", ""))) *
    100

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Campaign Header */}
        <div className="card-pastel bg-pastel-beige mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{campaign.title}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">by {campaign.brand}</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  campaign.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {campaign.status}
              </span>
              <button className="btn-primary">Apply to Campaign</button>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-200 text-lg">{campaign.description}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Campaign Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-pastel bg-pastel-mint text-center">
                <DollarSign className="w-8 h-8 text-gray-800 dark:text-gray-100 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{campaign.budget}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Budget</div>
              </div>
              <div className="card-pastel bg-pastel-lavender text-center">
                <Clock className="w-8 h-8 text-gray-800 dark:text-gray-100 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{campaign.duration}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Duration</div>
              </div>
              <div className="card-pastel bg-pastel-peach text-center">
                <Users className="w-8 h-8 text-gray-800 dark:text-gray-100 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{campaign.participants}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">KOLs</div>
              </div>
              <div className="card-pastel bg-pastel-sage text-center">
                <Target className="w-8 h-8 text-gray-800 dark:text-gray-100 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{campaign.targetReach}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Target Reach</div>
              </div>
            </div>

            {/* Progress */}
            <div className="card-pastel bg-white">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Campaign Progress</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <span>Current Reach: {campaign.currentReach}</span>
                  <span>Target: {campaign.targetReach}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-pastel-mint to-pastel-lavender dark:from-blue-500 dark:to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {progress.toFixed(1)}% Complete
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="card-pastel bg-pastel-mint">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Requirements</h3>
              <ul className="space-y-2">
                {campaign.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Deliverables */}
            <div className="card-pastel bg-pastel-lavender">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Deliverables</h3>
              <ul className="space-y-2">
                {campaign.deliverables.map((deliverable, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="w-5 h-5 text-gray-800 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">{deliverable}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Timeline */}
            <div className="card-pastel bg-white">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-100">Start Date</div>
                    <div className="text-gray-600 dark:text-gray-300">{campaign.startDate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-100">End Date</div>
                    <div className="text-gray-600 dark:text-gray-300">{campaign.endDate}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Participating KOLs */}
            <div className="card-pastel bg-pastel-peach">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Participating KOLs</h3>
              <div className="space-y-3">
                {campaign.kols.map((kol, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">{kol.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {kol.username} • {kol.followers}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        kol.status === "Confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {kol.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
