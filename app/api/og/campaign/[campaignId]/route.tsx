import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const API_BASE_URL = process.env.NEXT_PUBLIC_TRENDSAGE_API_URL || process.env.NEXT_PUBLIC_CREDBUZZ_API_URL || 'https://api.cred.buzz'

export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params
    
    // Fetch campaign data
    const campaignResponse = await fetch(`${API_BASE_URL}/campaign/get-campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaign_id: campaignId,
      }),
    })

    if (!campaignResponse.ok) {
      throw new Error('Failed to fetch campaign')
    }

    const campaignData = await campaignResponse.json()
    const campaign = campaignData?.result?.[0]

    if (!campaign) {
      throw new Error('Campaign not found')
    }

    // Fetch mindshare data if available
    let mindshareData = null
    if (campaign.target_x_handle) {
      try {
        const handle = campaign.target_x_handle.replace('@', '').toLowerCase()
        const mindshareResponse = await fetch(
          `${API_BASE_URL}/mindshare?project_name=${handle}&limit=5&period=30d`
        )
        if (mindshareResponse.ok) {
          const data = await mindshareResponse.json()
          mindshareData = data?.result?.mindshare_data?.slice(0, 5) || []
        }
      } catch (error) {
        console.error('Failed to fetch mindshare:', error)
      }
    }

    // Create the Open Graph image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#111827',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #374151 2px, transparent 0), radial-gradient(circle at 75px 75px, #374151 2px, transparent 0)',
            backgroundSize: '100px 100px',
            padding: '40px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
            }}
          >
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#F9FAFB',
                textAlign: 'center',
                margin: 0,
                maxWidth: '800px',
              }}
            >
              {campaign.campaign_name}
            </h1>
          </div>

          {/* Campaign Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '40px',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#1F2937',
                borderRadius: '12px',
                padding: '16px 24px',
                border: '1px solid #374151',
              }}
            >
              <span
                style={{
                  fontSize: '24px',
                  color: '#00D992',
                  fontWeight: 'bold',
                }}
              >
                💰 {campaign.amount} {campaign.payment_token}
              </span>
            </div>
            {campaign.target_x_handle && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#1F2937',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  border: '1px solid #374151',
                }}
              >
                <span
                  style={{
                    fontSize: '24px',
                    color: '#9CA3AF',
                  }}
                >
                  🎯 {campaign.target_x_handle}
                </span>
              </div>
            )}
          </div>

          {/* Mindshare Data */}
          {mindshareData && mindshareData.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '900px',
              }}
            >
              <h2
                style={{
                  fontSize: '32px',
                  color: '#00D992',
                  marginBottom: '24px',
                  fontWeight: 'bold',
                }}
              >
                Community Mindshare Leaders
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {mindshareData.map((influencer: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      backgroundColor: '#1F2937',
                      borderRadius: '16px',
                      padding: '20px',
                      border: '1px solid #374151',
                      minWidth: '160px',
                    }}
                  >
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: '#374151',
                        marginBottom: '12px',
                        backgroundImage: influencer.user_info?.profile_image_url 
                          ? `url(${influencer.user_info.profile_image_url})`
                          : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '18px',
                        color: '#F9FAFB',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '4px',
                      }}
                    >
                      {influencer.user_info?.name || influencer.author_handle || 'Unknown'}
                    </span>
                    <span
                      style={{
                        fontSize: '16px',
                        color: '#00D992',
                        fontWeight: 'bold',
                      }}
                    >
                      {influencer.mindshare_percent?.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 'auto',
              paddingTop: '40px',
            }}
          >
            <span
              style={{
                fontSize: '24px',
                color: '#6B7280',
                fontWeight: 'bold',
              }}
            >
              TrendSage - Web3 KOL Marketplace
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Failed to generate OG image:', error)
    
    // Return a fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#111827',
            color: '#F9FAFB',
          }}
        >
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            TrendSage Campaign
          </h1>
          <p
            style={{
              fontSize: '24px',
              color: '#9CA3AF',
              textAlign: 'center',
            }}
          >
            Web3 KOL Marketplace
          </p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
} 