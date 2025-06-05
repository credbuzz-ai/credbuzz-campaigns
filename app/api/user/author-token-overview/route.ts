import { NextRequest, NextResponse } from 'next/server'

const EXTERNAL_API_BASE = process.env.NEXT_PUBLIC_TRENDSAGE_API_URL || process.env.NEXT_PUBLIC_CREDBUZZ_API_URL || 'https://api.cred.buzz'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const authorHandle = searchParams.get('author_handle')
  const interval = searchParams.get('interval')

  if (!authorHandle) {
    return NextResponse.json({ error: 'author_handle parameter is required' }, { status: 400 })
  }

  try {
    const queryParams = new URLSearchParams({
      author_handle: authorHandle,
      ...(interval && { interval }),
    })

    const response = await fetch(`${EXTERNAL_API_BASE}/user/author-token-overview?${queryParams}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch author token overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch author token overview' }, 
      { status: 500 }
    )
  }
} 