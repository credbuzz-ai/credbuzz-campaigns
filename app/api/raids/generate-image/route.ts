import { NextRequest, NextResponse } from 'next/server'

const EXTERNAL_API_BASE = process.env.NEXT_PUBLIC_TRENDSAGE_API_URL || process.env.NEXT_PUBLIC_CREDBUZZ_API_URL || 'https://api.cred.buzz'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${EXTERNAL_API_BASE}/raids/generate-image`, {
      method: 'POST',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000), // Longer timeout for image generation
    })

    if (response.ok) {
      const result = await response.json()
      return NextResponse.json(result)
    } else {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }
  } catch (error) {
    console.error('Failed to generate image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
} 