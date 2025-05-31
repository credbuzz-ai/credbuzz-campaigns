"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { ExternalLink, Users, TrendingUp, Star, Loader2, Filter, ChevronDown, Search, RefreshCcw } from 'lucide-react'

interface JobResultsProps {
  projectHandle: string
  onRefresh?: () => void
}

interface InfluencerMatch {
  id: number
  project_id: string
  influencer_handle: string
  cred_score: number
  tier: string
  synergy_rating_to_project: number
  keywords_from_tweets: string[]
  synergy_rationale: string
  recommended_marketing_angle: string
  notes: string
  created_at: string
  updated_at: string
}

interface MatchmakingResults {
  project_id: string
  filters_applied: {
    tier_filter: string | null
    min_cred_score: number | null
    min_synergy_rating: number | null
    order_by: string
  }
  pagination: {
    page: number
    page_size: number
    has_next: boolean
    has_previous: boolean
    showing_count: number
    total_count?: number
    showing_results: string
  }
  matches: InfluencerMatch[]
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'tier-1': return 'bg-red-100 text-red-800'
    case 'tier-2': return 'bg-yellow-100 text-yellow-800'
    case 'tier-3': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getTierLabel = (tier: string) => {
  switch (tier) {
    case 'tier-1': return 'Tier 1 (Top)'
    case 'tier-2': return 'Tier 2'
    case 'tier-3': return 'Tier 3'
    default: return tier
  }
}

const getScoreColor = (score: number) => {
  if (score >= 4) return 'text-green-600'
  if (score >= 3) return 'text-yellow-600'
  return 'text-red-600'
}

export default function JobResults({ projectHandle, onRefresh }: JobResultsProps) {
  const [results, setResults] = useState<MatchmakingResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [tierFilter, setTierFilter] = useState<string | null>(null)
  const [minCredScore, setMinCredScore] = useState<number | null>(null)
  const [minSynergyRating, setMinSynergyRating] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch results
  const fetchResults = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
        include_total: 'true',
      })

      if (tierFilter) params.append('tier_filter', tierFilter)
      if (minCredScore !== null) params.append('min_cred_score', minCredScore.toString())
      if (minSynergyRating !== null) params.append('min_synergy_rating', minSynergyRating.toString())

      const response = await fetch(`/api/matchmaking/top-matches/${projectHandle}?${params.toString()}`, {
        signal: AbortSignal.timeout(15000),
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.data || data.result)
      } else {
        throw new Error(`Failed to fetch results: HTTP ${response.status}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results')
    } finally {
      setLoading(false)
    }
  }

  // Filter influencers by search term locally
  const filteredInfluencers = results?.matches.filter((influencer: InfluencerMatch) => 
    searchTerm === '' || 
    influencer.influencer_handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    influencer.synergy_rationale.toLowerCase().includes(searchTerm.toLowerCase()) ||
    influencer.recommended_marketing_angle.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  // Clear filters
  const clearFilters = () => {
    setTierFilter(null)
    setMinCredScore(null)
    setMinSynergyRating(null)
    setSearchTerm('')
    setCurrentPage(1)
  }

  // Fetch data when filters change
  useEffect(() => {
    fetchResults()
  }, [projectHandle, currentPage, pageSize, tierFilter, minCredScore, minSynergyRating])

  return (
    <Card className="mt-6">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-green-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Influencer Analysis Results
            </CardTitle>
            <p className="text-sm text-green-600 mt-1">
              Project: @{projectHandle}
            </p>
          </div>
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              className="text-green-700 border-green-200 hover:bg-green-50"
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Summary Stats */}
        {results && (
          <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{results.pagination.total_count || results.matches.length}</div>
              <div className="text-sm text-gray-600">Total Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{results.pagination.showing_count}</div>
              <div className="text-sm text-gray-600">Showing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{results.pagination.page}</div>
              <div className="text-sm text-gray-600">Page</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search influencers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                <select
                  value={tierFilter || ''}
                  onChange={(e) => setTierFilter(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Tiers</option>
                  <option value="tier-1">Tier 1 (Top)</option>
                  <option value="tier-2">Tier 2</option>
                  <option value="tier-3">Tier 3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Cred Score</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={minCredScore || ''}
                  onChange={(e) => setMinCredScore(e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0-5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Synergy Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={minSynergyRating || ''}
                  onChange={(e) => setMinSynergyRating(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1-5"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Container with 70vh height */}
        <div className="h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading results...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 font-semibold mb-2">Error Loading Results</div>
              <div className="text-gray-600 mb-4">{error}</div>
              <button
                onClick={fetchResults}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredInfluencers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {filteredInfluencers.map((influencer: InfluencerMatch) => (
                <div key={influencer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">@{influencer.influencer_handle}</h3>
                            <Badge className={getTierColor(influencer.tier)}>
                              {getTierLabel(influencer.tier)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                          onClick={() => window.open(`https://twitter.com/${influencer.influencer_handle}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Profile
                        </Button>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">Cred Score:</span>
                          <span className={`font-medium ${getScoreColor(influencer.cred_score)}`}>
                            {influencer.cred_score.toFixed(1)}/5
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">Synergy:</span>
                          <span className="font-medium text-purple-600">{influencer.synergy_rating_to_project}/5</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                          <span className="text-gray-600">Keywords:</span>
                          <span className="font-medium">{influencer.keywords_from_tweets.length}</span>
                        </div>
                      </div>

                      {/* Keywords */}
                      {influencer.keywords_from_tweets.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Related Keywords:</p>
                          <div className="flex flex-wrap gap-1">
                            {influencer.keywords_from_tweets.slice(0, 5).map((keyword: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {keyword}
                              </span>
                            ))}
                            {influencer.keywords_from_tweets.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{influencer.keywords_from_tweets.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Synergy Rationale */}
                      {influencer.synergy_rationale && (
                        <div className="mb-3 p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-purple-600 font-medium mb-1">Why this match works:</p>
                          <p className="text-sm text-purple-800">{influencer.synergy_rationale}</p>
                        </div>
                      )}

                      {/* Marketing Angle */}
                      {influencer.recommended_marketing_angle && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-green-600 font-medium mb-1">Recommended approach:</p>
                          <p className="text-sm text-green-800">{influencer.recommended_marketing_angle}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination - Fixed at bottom */}
          {results?.pagination && results.pagination.total_count && results.pagination.total_count > pageSize && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {results.pagination.showing_results}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!results.pagination.has_previous}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="px-3 py-1 text-sm">
                    Page {results.pagination.page}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!results.pagination.has_next}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 