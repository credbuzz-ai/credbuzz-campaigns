"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Loader2, Play, Eye, RotateCcw, Users, Target, CheckCircle } from 'lucide-react'
import JobResults from './JobResults'

// Simplified type definitions
interface JobStatus {
  id: number
  project_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at?: string
  error_message?: string
  status_info?: {
    message: string
    estimated_start_time?: string
    elapsed_time_minutes?: number
    estimated_completion?: string
    results_available?: boolean
    can_retry?: boolean
  }
  endpoints?: {
    job_details: string
    results?: string
    retry?: string
  }
}

interface MatchmakingResults {
  project_id: string
  pagination: {
    page: number
    page_size: number
    has_next: boolean
    has_previous: boolean
    showing_count: number
    total_count?: number
  }
  matches: any[]
}

interface JobManagerProps {
  projectHandle: string
}

export default function JobManager({ projectHandle }: JobManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isCheckingResults, setIsCheckingResults] = useState(true)
  const [currentJob, setCurrentJob] = useState<JobStatus | null>(null)
  const [existingResults, setExistingResults] = useState<MatchmakingResults | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for existing results and job status on mount
  useEffect(() => {
    checkExistingResultsAndJobStatus()
  }, [projectHandle])

  // Polling for job status when job is active
  useEffect(() => {
    if (currentJob && (currentJob.status === 'pending' || currentJob.status === 'processing')) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/jobs/project/${projectHandle}`, {
            signal: AbortSignal.timeout(10000),
          })
          
          if (response.ok) {
            const statusData = await response.json()
            const jobData = statusData.data
            setCurrentJob(jobData)
            
            // If job completed, check for results
            if (jobData.status === 'completed') {
              checkExistingResultsAndJobStatus()
            }
          }
        } catch (error) {
          console.error('Failed to poll job status:', error)
        }
      }, 5000) // Poll every 5 seconds

      return () => clearInterval(interval)
    }
  }, [currentJob, projectHandle])

  const checkExistingResultsAndJobStatus = async () => {
    setIsCheckingResults(true)
    setError(null)
    
    try {
      // First, check for existing matchmaking results
      const resultsResponse = await fetch(`/api/matchmaking/top-matches/${projectHandle}?page=1&page_size=1`, {
        signal: AbortSignal.timeout(10000),
      })
      
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json()
        const matches = resultsData.data || resultsData.result
        
        if (matches && matches.matches && matches.matches.length > 0) {
          // We have existing results
          setExistingResults(matches)
          setCurrentJob(null) // Clear any job status since we have results
          setShowResults(true) // Auto-show results
          return
        }
      }
      
      // No existing results, check for job status
      const jobResponse = await fetch(`/api/jobs/project/${projectHandle}`, {
        signal: AbortSignal.timeout(10000),
      })
      
      if (jobResponse.ok) {
        const jobData = await jobResponse.json()
        setCurrentJob(jobData.data)
        setExistingResults(null)
        setShowResults(false)
      } else if (jobResponse.status === 404) {
        // No jobs exist for this project
        setCurrentJob(null)
        setExistingResults(null)
        setShowResults(false)
      }
    } catch (error) {
      console.error('Failed to check results and job status:', error)
      setError('Failed to check existing results and job status')
    } finally {
      setIsCheckingResults(false)
    }
  }

  const createJob = async () => {
    setIsCreating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectHandle,
        }),
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const result = await response.json()
        const jobData = result.data
        setCurrentJob(jobData)
        setExistingResults(null) // Clear existing results since we're starting new job
        setShowResults(false) // Hide results until new job completes
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.details || errorData.error || `HTTP ${response.status}`)
      }
    } catch (error) {
      setError(`Failed to create job: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Job creation error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const retryJob = async () => {
    if (!currentJob) return

    try {
      const response = await fetch(`/api/jobs/${currentJob.id}/retry`, {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const result = await response.json()
        const jobData = result.data
        setCurrentJob(jobData)
        setError(null)
      } else {
        throw new Error('Failed to retry job')
      }
    } catch (error) {
      setError('Failed to retry job. Please try again.')
      console.error('Job retry error:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': 
      case 'processing': 
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'completed': 
        return <Users className="h-4 w-4" />
      case 'failed': 
        return <RotateCcw className="h-4 w-4" />
      default: 
        return null
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    return `${diffHours}h ago`
  }

  // Show loading state while checking
  if (isCheckingResults) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600 mr-2" />
            <span className="text-purple-800">Checking for existing results...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Target className="h-5 w-5" />
            Influencer Matchmaking for @{projectHandle}
          </CardTitle>
          <p className="text-sm text-purple-600">
            Find the perfect influencers to promote your project using AI-powered analysis
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Existing Results */}
          {existingResults && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Analysis Complete!</p>
                    <p className="text-sm text-green-700">
                      Found {existingResults.pagination.showing_count} influencer matches for @{projectHandle}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowResults(!showResults)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {showResults ? 'Hide Results' : 'View Results'}
                  </Button>
                  <Button
                    onClick={createJob}
                    disabled={isCreating}
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    New Analysis
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Job Status */}
          {currentJob && !existingResults && (
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(currentJob.status)}>
                    {getStatusIcon(currentJob.status)}
                    <span className="ml-1 capitalize">{currentJob.status}</span>
                  </Badge>
                  <span className="text-sm text-gray-500">Job ID: {currentJob.id}</span>
                </div>
                <div className="flex gap-2">
                  {currentJob.status === 'completed' && (
                    <Button
                      onClick={() => setShowResults(!showResults)}
                      size="sm"
                      variant="outline"
                      className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {showResults ? 'Hide Results' : 'View Results'}
                    </Button>
                  )}
                  {currentJob.status === 'failed' && currentJob.status_info?.can_retry && (
                    <Button
                      onClick={retryJob}
                      size="sm"
                      variant="outline"
                      className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>

              {/* Status Information */}
              {currentJob.status_info && (
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-sm text-gray-700 mb-2">{currentJob.status_info.message}</p>
                  
                  {currentJob.status_info.estimated_start_time && (
                    <p className="text-xs text-gray-600">
                      <strong>Estimated start:</strong> {currentJob.status_info.estimated_start_time}
                    </p>
                  )}
                  
                  {currentJob.status_info.elapsed_time_minutes && (
                    <p className="text-xs text-gray-600">
                      <strong>Elapsed time:</strong> {currentJob.status_info.elapsed_time_minutes} minutes
                    </p>
                  )}
                  
                  {currentJob.status_info.estimated_completion && (
                    <p className="text-xs text-gray-600">
                      <strong>Estimated completion:</strong> {currentJob.status_info.estimated_completion}
                    </p>
                  )}
                </div>
              )}

              {/* Error Message */}
              {currentJob.status === 'failed' && currentJob.error_message && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-800 text-sm">{currentJob.error_message}</p>
                </div>
              )}

              {/* Created Time */}
              <p className="text-xs text-gray-500">
                Created {formatTimeAgo(currentJob.created_at)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!existingResults && (
            <div className="flex gap-2">
              {!currentJob || currentJob.status === 'failed' || currentJob.status === 'completed' ? (
                <Button
                  onClick={createJob}
                  disabled={isCreating}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {currentJob?.status === 'completed' ? 'Start New Analysis' : 'Start Analysis'}
                </Button>
              ) : null}
            </div>
          )}

          {/* Info Section */}
          {!currentJob && !existingResults && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3 text-sm text-blue-800">
                <Target className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">What happens during analysis:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-blue-700">
                    <li>AI analyzes thousands of potential influencer matches</li>
                    <li>Evaluates audience overlap, engagement quality, and brand alignment</li>
                    <li>Generates comprehensive match scores and recommendations</li>
                    <li>Typical analysis takes 5-15 minutes to complete</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inline Job Results */}
      {showResults && (existingResults || currentJob?.status === 'completed') && (
        <JobResults
          projectHandle={projectHandle}
          onRefresh={checkExistingResultsAndJobStatus}
        />
      )}
    </div>
  )
} 