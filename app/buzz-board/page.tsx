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
        return "bg-green-100 text-green-800"
      case "Recruiting":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "DeFi":
        return "bg-pastel-mint dark:bg-gray-700"
      case "NFTs":
        return "bg-pastel-lavender dark:bg-gray-800"
      case "Gaming":
        return "bg-pastel-peach dark:bg-gray-700"
      case "Education":
        return "bg-pastel-sage dark:bg-gray-800"
      case "Metaverse":
        return "bg-pastel-beige dark:bg-gray-700"
      default:
        return "bg-pastel-cream dark:bg-gray-800"
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Buzz Board</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Discover and join active Web3 marketing campaigns</p>
        </div>

        {/* Filters */}
        <div className="card-pastel bg-white mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search campaigns or brands..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl 
             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
             focus:outline-none focus:ring-2 focus:ring-pastel-mint dark:focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl 
             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
             focus:outline-none focus:ring-2 focus:ring-pastel-mint dark:focus:ring-blue-500"
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
              className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl 
             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
             focus:outline-none focus:ring-2 focus:ring-pastel-mint dark:focus:ring-blue-500"
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
          <div className="card-pastel bg-pastel-mint text-center">
            <TrendingUp className="w-8 h-8 text-gray-800 dark:text-gray-100 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {campaigns.filter((c) => c.status === "Active").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Active Campaigns</div>
          </div>
          <div className="card-pastel bg-pastel-lavender text-center">
            <Users className="w-8 h-8 text-gray-800 dark:text-gray-100 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {campaigns.reduce((sum, c) => sum + c.participants, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total KOLs</div>
          </div>
          <div className="card-pastel bg-pastel-peach text-center">
            <DollarSign className="w-8 h-8 text-gray-800 dark:text-gray-100 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">$340K</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Budget</div>
          </div>
          <div className="card-pastel bg-pastel-sage text-center">
            <Clock className="w-8 h-8 text-gray-800 dark:text-gray-100 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {campaigns.filter((c) => c.status === "Recruiting").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Recruiting</div>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <Link key={campaign.id} href={`/projects/${campaign.id}`}>
              <div
                className={`card-pastel ${getCategoryColor(campaign.category)} hover:scale-105 transition-transform cursor-pointer h-full`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 dark:text-gray-200">
                    {campaign.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{campaign.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">by {campaign.brand}</p>
                <p className="text-gray-700 dark:text-gray-200 mb-6 line-clamp-2">{campaign.description}</p>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {campaign.budget}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {campaign.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {campaign.participants} KOLs
                    </span>
                  </div>

                  {campaign.status === "Active" && (
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <span>Progress</span>
                        <span>{campaign.progress}%</span>
                      </div>
                      <div className="w-full bg-white dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-gray-800 dark:bg-gray-300 h-2 rounded-full transition-all duration-300"
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
            <p className="text-gray-600 dark:text-gray-300 text-lg">No campaigns found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
