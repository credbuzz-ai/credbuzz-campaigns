import { NextRequest, NextResponse } from 'next/server'

const EXTERNAL_API_BASE = process.env.NEXT_PUBLIC_TRENDSAGE_API_URL || process.env.NEXT_PUBLIC_CREDBUZZ_API_URL || 'https://api.cred.buzz'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  try {
    // Forward all query parameters to the external API
    const queryString = searchParams.toString()
    const url = `${EXTERNAL_API_BASE}/raids/tweet-feed${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      const result = await response.json()
      return NextResponse.json(result)
    } else {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }
  } catch (error) {
    console.error('Failed to fetch tweet feed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tweet feed', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
} 