"use client"

import { useState, useEffect } from 'react'
import { Users, Star, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface KOL {
  author_handle: string
  name: string
  score: number
  followers: number
  smart_followers: number
  avg_views: number
  profile_image_url: string
}

interface LeaderboardResponse {
  result: {
    data: KOL[]
    total: number
    start: number
    limit: number
  }
  message: string
}

const ITEMS_PER_PAGE = 50

export default function KOLsPage() {
  const [kols, setKols] = useState<KOL[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const fetchKOLs = async (page: number) => {
    setLoading(true)
    setError(null)

    try {
      const start = (page - 1) * ITEMS_PER_PAGE
      
      const response = await fetch('https://api.cred.buzz/user/get-score-leaderboard', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: start,
          limit: ITEMS_PER_PAGE,
          author_handle: ""
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data: LeaderboardResponse = await response.json()
      setKols(data.result.data)
      setTotalItems(data.result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch KOLs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKOLs(currentPage)
  }, [currentPage])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-[#00D992]'
    if (score >= 4.0) return 'text-yellow-400'
    return 'text-red-400'
  }

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-[#00D992]" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100">KOL Leaderboard</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-400">
            Top-performing Key Opinion Leaders ranked by their credibility scores
          </p>
        </div>

        {/* Content */}
        <div className="card-trendsage">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D992]"></div>
              <span className="ml-3 text-sm sm:text-base text-gray-300">Loading KOLs...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 font-semibold text-sm sm:text-base mb-2">Error Loading KOLs</div>
              <div className="text-gray-400 text-xs sm:text-sm mb-4">{error}</div>
              <button
                onClick={() => fetchKOLs(currentPage)}
                className="btn-primary"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing {startItem}-{endItem} of {formatNumber(totalItems)} KOLs
                  </div>
                  <div className="text-xs text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        KOL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Followers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Smart Followers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Avg Views
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {kols.map((kol, index) => {
                      const rank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1
                      return (
                        <tr key={kol.author_handle} className="hover:bg-gray-700 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                            #{rank}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={kol.profile_image_url}
                                alt={kol.name}
                                className="w-10 h-10 rounded-full mr-3 ring-2 ring-transparent group-hover:ring-[#00D992]/50 transition-all"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                                }}
                              />
                              <div>
                                <Link
                                  href={`/kols/${kol.author_handle}`}
                                  className="text-sm font-medium text-gray-200 hover:text-[#00D992] transition-colors"
                                >
                                  {kol.name}
                                </Link>
                                <div className="text-xs text-gray-500">@{kol.author_handle}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              <span className={`text-sm font-semibold ${getScoreColor(kol.score)}`}>
                                {kol.score.toFixed(1)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                            {formatNumber(kol.followers)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                            {formatNumber(kol.smart_followers)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-200">
                              <Eye className="w-4 h-4 text-gray-400 mr-1" />
                              {formatNumber(kol.avg_views)}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm text-gray-400">
                    Showing {startItem}-{endItem} of {formatNumber(totalItems)} results
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-1 text-xs sm:text-sm border border-gray-600 rounded hover:bg-gray-700 hover:border-[#00D992]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-300"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Show page numbers around current page */}
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 text-xs sm:text-sm border rounded transition-colors ${
                              currentPage === pageNum
                                ? 'bg-[#00D992] text-gray-900 border-[#00D992]'
                                : 'border-gray-600 hover:bg-gray-700 hover:border-[#00D992]/50 text-gray-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-1 text-xs sm:text-sm border border-gray-600 rounded hover:bg-gray-700 hover:border-[#00D992]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-300"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 