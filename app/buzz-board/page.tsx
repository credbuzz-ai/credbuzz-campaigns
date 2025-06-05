"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, DollarSign, Clock, Users, TrendingUp } from "lucide-react"

const campaigns = [
  {
    id: "defi-summer-2024",
    title: "DeFi Summer 2024 Campaign",
    brand: "Compound Finance",
    budget: "$50,000",
    duration: "30 days",
    participants: 12,
    status: "Active",
    category: "DeFi",
    description: "Educate users about DeFi innovations and drive adoption of Compound V3 protocol.",
    progress: 68,
  },
  {
    id: "nft-marketplace-launch",
    title: "NFT Marketplace Launch",
    brand: "OpenSea",
    budget: "$75,000",
    duration: "45 days",
    participants: 18,
    status: "Active",
    category: "NFTs",
    description: "Promote the new NFT marketplace features and creator tools.",
    progress: 45,
  },
  {
    id: "layer2-education",
    title: "Layer 2 Education Series",
    brand: "Polygon",
    budget: "$30,000",
    duration: "21 days",
    participants: 8,
    status: "Completed",
    category: "Education",
    description: "Educational content series about Layer 2 scaling solutions.",
    progress: 100,
  },
  {
    id: "dao-governance",
    title: "DAO Governance Campaign",
    brand: "Uniswap",
    budget: "$40,000",
    duration: "28 days",
    participants: 15,
    status: "Recruiting",
    category: "DeFi",
    description: "Increase participation in DAO governance and voting.",
    progress: 0,
  },
  {
    id: "web3-gaming",
    title: "Web3 Gaming Revolution",
    brand: "Immutable X",
    budget: "$60,000",
    duration: "35 days",
    participants: 20,
    status: "Active",
    category: "Gaming",
    description: "Showcase the future of blockchain gaming and NFT integration.",
    progress: 23,
  },
  {
    id: "metaverse-fashion",
    title: "Metaverse Fashion Week",
    brand: "Decentraland",
    budget: "$85,000",
    duration: "14 days",
    participants: 25,
    status: "Completed",
    category: "Metaverse",
    description: "Virtual fashion show and digital wearables campaign.",
    progress: 100,
  },
]

const categories = ["All", "DeFi", "NFTs", "Gaming", "Education", "Metaverse"]
const statuses = ["All", "Active", "Recruiting", "Completed"]

export default function BuzzBoard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || campaign.category === selectedCategory
    const matchesStatus = selectedStatus === "All" || campaign.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#00D992]/20 text-[#00D992] border-[#00D992]/30"
      case "Recruiting":
        return "bg-blue-900/50 text-blue-300 border-blue-700"
      case "Completed":
        return "bg-gray-700/50 text-gray-300 border-gray-600"
      default:
        return "bg-gray-700/50 text-gray-300 border-gray-600"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "DeFi":
        return "bg-[#00D992]/10 border-[#00D992]/30 hover:border-[#00D992]/50"
      case "NFTs":
        return "bg-purple-900/20 border-purple-700/50 hover:border-purple-600"
      case "Gaming":
        return "bg-orange-900/20 border-orange-700/50 hover:border-orange-600"
      case "Education":
        return "bg-blue-900/20 border-blue-700/50 hover:border-blue-600"
      case "Metaverse":
        return "bg-indigo-900/20 border-indigo-700/50 hover:border-indigo-600"
      default:
        return "bg-gray-800 border-gray-700 hover:border-[#00D992]/30"
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-4">Buzz Board</h1>
          <p className="text-xl text-gray-300">Discover and join active Web3 marketing campaigns</p>
        </div>

        {/* Filters */}
        <div className="card-trendsage mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search campaigns or brands..."
                className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-xl 
             bg-gray-700 text-gray-100 placeholder-gray-400
             focus-trendsage transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="px-4 py-3 border border-gray-600 rounded-xl 
             bg-gray-700 text-gray-100
             focus-trendsage"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="px-4 py-3 border border-gray-600 rounded-xl 
             bg-gray-700 text-gray-100
             focus-trendsage"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-trendsage text-center group">
            <TrendingUp className="w-8 h-8 text-[#00D992] mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-gray-100">
              {campaigns.filter((c) => c.status === "Active").length}
            </div>
            <div className="text-sm text-gray-400">Active Campaigns</div>
          </div>
          <div className="card-trendsage text-center group">
            <Users className="w-8 h-8 text-[#00D992] mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-gray-100">
              {campaigns.reduce((sum, c) => sum + c.participants, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Participants</div>
          </div>
          <div className="card-trendsage text-center group">
            <DollarSign className="w-8 h-8 text-[#00D992] mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-gray-100">$340K</div>
            <div className="text-sm text-gray-400">Total Budget</div>
          </div>
          <div className="card-trendsage text-center group">
            <Clock className="w-8 h-8 text-[#00D992] mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold text-gray-100">
              {campaigns.filter((c) => c.status === "Recruiting").length}
            </div>
            <div className="text-sm text-gray-400">Recruiting</div>
          </div>
        </div>

        {/* Campaign Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/buzz-board/${campaign.id}`}
              className="group hover:scale-[1.02] transition-transform"
            >
              <div className={`${getCategoryColor(campaign.category)} p-6 rounded-xl border h-full transition-all duration-200`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-100 mb-1 group-hover:text-[#00D992] transition-colors">
                      {campaign.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{campaign.brand}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{campaign.description}</p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Budget:</span>
                    <span className="text-gray-200 font-medium">{campaign.budget}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-gray-200">{campaign.duration}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Participants:</span>
                    <span className="text-gray-200">{campaign.participants}</span>
                  </div>
                  
                  {campaign.status !== "Recruiting" && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Progress</span>
                        <span className="text-gray-200 text-sm">{campaign.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#00D992] to-[#00F5A8] h-2 rounded-full transition-all"
                          style={{ width: `${campaign.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No campaigns found</div>
            <div className="text-gray-500 text-sm">Try adjusting your search or filter criteria</div>
          </div>
        )}
      </div>
    </div>
  )
}
