"use client"

import { useState, useEffect } from "react"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip
} from "recharts"

// Define the types based on the API response
interface Token {
  symbol: string
  marketcap: number
}

interface Bucket {
  bucket: string
  token_count: number
  tokens: Token[]
}

interface MarketCapData {
  overall_avg_marketcap: number
  overall_median_marketcap: number
  buckets: Bucket[]
}

interface ApiResponse {
  result: MarketCapData
  message: string
}

// Define colors for different buckets
const COLORS = {
  Micro: "#8884d8", // Purple
  Low: "#82ca9d",   // Green
  Mid: "#ffc658",   // Yellow
  Large: "#ff7300", // Orange
  Blue: "#0088fe"   // Blue
}

// Function to format large numbers
const formatMarketCap = (value: number) => {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
        <p className="text-sm font-medium text-gray-900">{data.bucket}</p>
        <p className="text-xs text-gray-600">Tokens: {data.token_count}</p>
      </div>
    )
  }
  return null
}

const BubbleTooltip = ({ token }: { token: Token }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs z-50">
      <p className="font-medium">{token.symbol.toUpperCase()}</p>
      <p>Market Cap: {formatMarketCap(token.marketcap)}</p>
    </div>
  )
}

const PIE_PADDING_ANGLE_DEG = 2.0; // Define globally for the component
const GLOBAL_PIE_START_ANGLE_DEG = 225; // Calculated to center Blue sector (last) at 12 o'clock

interface PositionedToken {
  token: Token;
  x: number;
  y: number;
  size: number;
  bucket: string;
}

export default function MarketCapDistribution({ authorHandle }: { authorHandle: string }) {
  const [marketCapData, setMarketCapData] = useState<MarketCapData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hoveredToken, setHoveredToken] = useState<Token | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const fetchMarketCapData = async () => {
      try {
        setLoading(true)
        // Simulate API call for testing with provided JSON structure
        // const response = await fetch(`https://api.cred.buzz/user/first-call-marketcap?author_handle=${authorHandle}`)
        // if (!response.ok) {
        //   throw new Error(`API request failed with status ${response.status}`)
        // }
        // const data: ApiResponse = await response.json()
        const mockData: ApiResponse = {
          "result": {
            "overall_avg_marketcap": 1408681033,
            "overall_median_marketcap": 425372127,
            "buckets": [
              {
                "bucket": "Micro",
                "token_count": 5,
                "tokens": [
                  { "symbol": "tsla", "marketcap": 21943 }, { "symbol": "ndx", "marketcap": 304662 },
                  { "symbol": "DXY", "marketcap": 711898.57 }, { "symbol": "rez", "marketcap": 68093 },
                  { "symbol": "talk", "marketcap": 8328839 }
                ]
              },
              {
                "bucket": "Low", "token_count": 2,
                "tokens": [ { "symbol": "looks", "marketcap": 15845838 }, { "symbol": "kernel", "marketcap": 30297000 } ]
              },
              {
                "bucket": "Mid", "token_count": 11,
                "tokens": [
                  { "symbol": "tst", "marketcap": 56132442 }, { "symbol": "ark", "marketcap": 63108309 },
                  { "symbol": "vana", "marketcap": 174503481 }, { "symbol": "flux", "marketcap": 102060138 },
                  { "symbol": "scrt", "marketcap": 75174629 }, { "symbol": "chr", "marketcap": 92385536 },
                  { "symbol": "edu", "marketcap": 78229430 }, { "symbol": "mask", "marketcap": 173795080 },
                  { "symbol": "lit", "marketcap": 87724059 }, { "symbol": "alpaca", "marketcap": 161726273 },
                  { "symbol": "fxs", "marketcap": 219393507 }
                ]
              },
              {
                "bucket": "Large", "token_count": 8,
                "tokens": [
                  { "symbol": "spx", "marketcap": 549814809 }, { "symbol": "floki", "marketcap": 572165492 },
                  { "symbol": "hnt", "marketcap": 595988323 }, { "symbol": "id", "marketcap": 477273990 },
                  { "symbol": "fartcoin", "marketcap": 575574164 }, { "symbol": "snx", "marketcap": 606703672 },
                  { "symbol": "brett", "marketcap": 366624358 }, { "symbol": "chz", "marketcap": 425372127 }
                ]
              },
              {
                "bucket": "Blue", "token_count": 13,
                "tokens": [
                  { "symbol": "link", "marketcap": 10609823471 }, { "symbol": "zk", "marketcap": 2055648851 },
                  { "symbol": "wbeth", "marketcap": 6949937941 }, { "symbol": "trump", "marketcap": 5094815348 },
                  { "symbol": "s", "marketcap": 1608727361 }, { "symbol": "op", "marketcap": 2252984005 },
                  { "symbol": "om", "marketcap": 1205118361 }, { "symbol": "me", "marketcap": 1112268859 },
                  { "symbol": "kaito", "marketcap": 1417774331 }, { "symbol": "imx", "marketcap": 1114699926 },
                  { "symbol": "hbar", "marketcap": 11063858557 }, { "symbol": "etc", "marketcap": 3117550435 },
                  { "symbol": "bnsol", "marketcap": 1826024747 }
                ]
              }
            ]
          },
          "message": "First call marketcap analysis fetched successfully"
        }
        setMarketCapData(mockData.result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (authorHandle) {
      fetchMarketCapData()
    }
  }, [authorHandle])

  if (loading) {
    return <div className="p-6 text-center">Loading market cap distribution...</div>
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>
  }

  if (!marketCapData) {
    return <div className="p-6 text-center">No market cap data available</div>
  }

  const pieChartData = marketCapData.buckets.map(bucket => ({
    bucket: bucket.bucket,
    token_count: bucket.token_count,
    tokens: bucket.tokens,
    value: bucket.token_count, 
  }))

  const handleBubbleHover = (e: React.MouseEvent, token: Token) => {
    setHoveredToken(token)
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }

  const handleBubbleLeave = () => {
    setHoveredToken(null)
  }

  const handlePieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const handlePieLeave = () => {
    setActiveIndex(null)
  }

  const getBubbleSize = (marketcap: number) => {
    return Math.max(25, Math.min(50, Math.log10(marketcap) * 4.5))
  }

  const normalizeAngle = (angle: number) => (angle % 360 + 360) % 360;

  const createSectorsAndBubbles = () => {
    const boxWidth = 600; 
    const boxHeight = 400;
    const centerX = boxWidth / 2;
    const centerY = boxHeight / 2;
    
    const totalValueForPie = pieChartData.reduce((sum, entry) => sum + entry.value, 0);
    
    let currentLogicalAngleDeg = 0;
    const calculatedSectors = pieChartData.map((data) => {
      const sectorAngleProportion = data.value / totalValueForPie;
      const logicalSectorAngleDeg = sectorAngleProportion * 360;
      const logicalStartAngleDeg = currentLogicalAngleDeg;
      currentLogicalAngleDeg += logicalSectorAngleDeg;
      const logicalEndAngleDeg = currentLogicalAngleDeg;
      return {
        bucket: data.bucket,
        logicalStartAngleDeg,
        logicalEndAngleDeg,
        color: COLORS[data.bucket as keyof typeof COLORS],
        tokens: data.tokens 
      };
    });

    const pieOuterRadius = 80; 
    const initialRadialOffset = pieOuterRadius + 35; 
    const radialIncrementPerArc = 35; 
    const angularWidthFractionForBubbles = 0.95; // How much of visual sector width bubbles occupy
    const maxBubblesPerArc = 4; 

    const allPositionedBubbles: PositionedToken[] = calculatedSectors.flatMap(sector => {
        const visualSectorStartDeg_noRot = sector.logicalStartAngleDeg + PIE_PADDING_ANGLE_DEG / 2.0;
        const visualSectorEndDeg_noRot = sector.logicalEndAngleDeg - PIE_PADDING_ANGLE_DEG / 2.0;
        
        if (visualSectorStartDeg_noRot >= visualSectorEndDeg_noRot) {
            return [];
        }

        const visualSectorMidDeg_noRot = (visualSectorStartDeg_noRot + visualSectorEndDeg_noRot) / 2.0;
        const visualAngularSpanDeg = visualSectorEndDeg_noRot - visualSectorStartDeg_noRot;
        
        const placementSpanDeg = visualAngularSpanDeg * angularWidthFractionForBubbles;
        const firstBubbleAngleDeg_noRot_inSector = visualSectorMidDeg_noRot - placementSpanDeg / 2.0;

        const positionedTokensInSector: PositionedToken[] = [];
        let currentArcRadius = initialRadialOffset;
        
        for (let i = 0; i < sector.tokens.length; i += maxBubblesPerArc) {
            const arcTokens = sector.tokens.slice(i, i + maxBubblesPerArc);
            const numBubblesInThisArc = arcTokens.length;

            arcTokens.forEach((token, arcTokenIndex) => {
                const size = getBubbleSize(token.marketcap);
                const bubbleRadius = size / 2;

                let angleDeg_noRot_inSector;
                if (numBubblesInThisArc === 1) {
                    angleDeg_noRot_inSector = visualSectorMidDeg_noRot; 
                } else {
                    const angleStepDeg = placementSpanDeg / (numBubblesInThisArc - 1);
                    angleDeg_noRot_inSector = firstBubbleAngleDeg_noRot_inSector + arcTokenIndex * angleStepDeg;
                }
                
                const finalBubbleAngleScreenDeg = normalizeAngle(angleDeg_noRot_inSector + GLOBAL_PIE_START_ANGLE_DEG);
                const finalBubbleAngleScreenRad = finalBubbleAngleScreenDeg * (Math.PI / 180);

                let x = centerX + currentArcRadius * Math.cos(finalBubbleAngleScreenRad);
                let y = centerY + currentArcRadius * Math.sin(finalBubbleAngleScreenRad);

                x = Math.max(bubbleRadius + 5, Math.min(x, boxWidth - bubbleRadius - 5));
                y = Math.max(bubbleRadius + 5, Math.min(y, boxHeight - bubbleRadius - 5));
                
                positionedTokensInSector.push({
                    token,
                    x,
                    y,
                    size,
                    bucket: sector.bucket,
                });
            });
            currentArcRadius += radialIncrementPerArc; 
        }
        return positionedTokensInSector;
    });

    return { sectors: calculatedSectors, bubbles: allPositionedBubbles };
  };
  
  const { sectors, bubbles } = createSectorsAndBubbles();

  return (
    <div className="card-pastel !bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Market Cap Distribution</h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-gray-500">
            Avg: {formatMarketCap(marketCapData.overall_avg_marketcap)} | 
            Median: {formatMarketCap(marketCapData.overall_median_marketcap)}
          </p>
        </div>
      </div>

      {/* Main container for the visualization */}
      <div className="relative mx-auto" style={{ width: 600, height: 400, border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        {/* Draw sectors dividing lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {sectors.map((sector) => {
            const lineAngleScreenDeg = normalizeAngle(sector.logicalStartAngleDeg + GLOBAL_PIE_START_ANGLE_DEG);
            const lineAngleScreenRad = lineAngleScreenDeg * (Math.PI / 180);
            const lineRadius = Math.max(600, 400); // Ensure lines reach edges, using fixed values
            
            const lineX = 300 + Math.cos(lineAngleScreenRad) * lineRadius
            const lineY = 200 + Math.sin(lineAngleScreenRad) * lineRadius
            
            return (
              <line 
                key={`line-${sector.bucket}-${sector.logicalStartAngleDeg}`}
                x1={300}
                y1={200}
                x2={lineX}
                y2={lineY}
                stroke="#e0e0e0" // Lighter gray for lines
                strokeWidth="1"
              />
            )
          })}
        </svg>
        
        {/* Pie chart in center */}
        <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', zIndex: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={50} // Adjusted inner/outer radius for pie
                outerRadius={80}
                paddingAngle={PIE_PADDING_ANGLE_DEG}
                startAngle={GLOBAL_PIE_START_ANGLE_DEG}
                dataKey="value"
                onMouseEnter={handlePieEnter}
                onMouseLeave={handlePieLeave}
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={(props: any) => { // Added type for props
                  const { cx, cy, innerRadius = 0, outerRadius = 0, startAngle, endAngle, fill } = props // Added default for inner/outerRadius
                  const RADIAN = Math.PI / 180;
                  // Active shape extends slightly more for emphasis
                  const GHOST_RADIUS_EXTENSION = 10;
                  const ghostOuterRadius = outerRadius + GHOST_RADIUS_EXTENSION;

                  return (
                    <g>
                      <path 
                        d={`M${cx},${cy}
                           L${cx + ghostOuterRadius * Math.cos(-startAngle * RADIAN)},${cy + ghostOuterRadius * Math.sin(-startAngle * RADIAN)}
                           A${ghostOuterRadius},${ghostOuterRadius},0,0,0,${cx + ghostOuterRadius * Math.cos(-endAngle * RADIAN)},${cy + ghostOuterRadius * Math.sin(-endAngle * RADIAN)}
                           Z`}
                        fill={fill}
                        fillOpacity={0.3} // More subtle active effect
                      />
                      <path
                         d={`M${cx},${cy}
                           L${cx + outerRadius * Math.cos(-startAngle * RADIAN)},${cy + outerRadius * Math.sin(-startAngle * RADIAN)}
                           A${outerRadius},${outerRadius},0,0,0,${cx + outerRadius * Math.cos(-endAngle * RADIAN)},${cy + outerRadius * Math.sin(-endAngle * RADIAN)}
                           Z`}
                        fill={fill}
                      />
                    </g>
                  )
                }}
              >
                {pieChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.bucket as keyof typeof COLORS]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1050 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bubbles */}
        <div className="absolute inset-0 pointer-events-none" style={{ width: 600, height: 400, zIndex: 3 }}>
          {bubbles.map((bubble, i) => (
            <div
              key={`bubble-${i}-${bubble.token.symbol}`}
              className="absolute rounded-full flex items-center justify-center text-xs font-semibold text-white uppercase pointer-events-auto shadow-md"
              style={{
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                left: `${bubble.x}px`, 
                top: `${bubble.y}px`,
                backgroundColor: COLORS[bubble.bucket as keyof typeof COLORS],
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.2s ease-out',
                opacity: hoveredToken?.symbol === bubble.token.symbol ? 1 : 0.9,
                border: hoveredToken?.symbol === bubble.token.symbol ? `2px solid white` : '1px solid rgba(0,0,0,0.1)',
                zIndex: hoveredToken?.symbol === bubble.token.symbol ? 20 : 5, 
              }}
              onMouseEnter={(e) => handleBubbleHover(e, bubble.token)}
              onMouseLeave={handleBubbleLeave}
              title={`${bubble.token.symbol} - ${formatMarketCap(bubble.token.marketcap)}`}
            >
              {bubble.token.symbol.substring(0, 3)}
            </div>
          ))}
        </div>

        {/* Legend below the chart */}
      </div>
      <div className="flex justify-center gap-x-4 gap-y-2 mt-4 flex-wrap">
          {Object.entries(COLORS).map(([bucket, color]) => (
            <div key={bucket} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs font-medium text-gray-600">{bucket}</span>
            </div>
          ))}
        </div>

        {/* Token Tooltip (fixed position) */}
        {hoveredToken && (
          <div 
            className="fixed z-[1000] pointer-events-none shadow-xl"
            style={{
              left: `${tooltipPosition.x + 15}px`,
              top: `${tooltipPosition.y - 10}px`,
              transform: 'translateY(-100%)'
            }}
          >
            <BubbleTooltip token={hoveredToken} />
          </div>
        )}
    </div>
  )
} 