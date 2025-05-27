"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Matter from "matter-js"
// Removed Recharts imports - using custom pie chart

// Type definitions
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

interface PhysicsBubble {
  id: string
  symbol: string
  marketcap: number
  bucket: string
  x: number
  y: number
  size: number
  bodyId: number
}

interface CalculatedSector {
  bucket: string
  startAngle: number
  endAngle: number
  color: string
  tokens: Token[]
}

// Constants
const COLORS = {
  Micro: "#8884d8", // Purple
  Low: "#82ca9d",   // Green
  Mid: "#ffc658",   // Yellow
  Large: "#ff7300", // Orange
  Blue: "#0088fe"   // Blue
}

const CONTAINER_WIDTH = 600
const CONTAINER_HEIGHT = 400
const PIE_OUTER_RADIUS = 80
const PIE_INNER_RADIUS = 0
const PIE_PADDING_ANGLE = 1
const PIE_START_ANGLE = -90

// Utility functions
const formatMarketCap = (value: number) => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

const normalizeAngle = (angle: number) => {
  const normalized = angle % 360
  return normalized < 0 ? normalized + 360 : normalized
}

const getBubbleSize = (marketcap: number) => {
  return Math.max(20, Math.min(45, Math.log10(marketcap) * 4))
}

// Shared angle calculation function to ensure consistency
const calculateAngles = (data: any[]) => {
  const totalValue = data.reduce((sum, entry) => sum + entry.value, 0)
  const totalAngleAvailable = 360 - (data.length * PIE_PADDING_ANGLE)
  
  let currentAngle = PIE_START_ANGLE
  return data.map((entry, index) => {
    const sliceAngle = totalValue > 0 ? (entry.value / totalValue) * totalAngleAvailable : 0
    const startAngle = currentAngle
    const endAngle = currentAngle + sliceAngle
    currentAngle = endAngle + PIE_PADDING_ANGLE
    
    return {
      ...entry,
      startAngle,
      endAngle,
      sliceAngle
    }
  })
}

// Components
// Custom Pie Chart Component
const CustomPieChart = ({ 
  data, 
  centerX, 
  centerY, 
  innerRadius, 
  outerRadius, 
  onSegmentHover, 
  onSegmentLeave,
  hoveredIndex 
}: {
  data: any[]
  centerX: number
  centerY: number
  innerRadius: number
  outerRadius: number
  onSegmentHover: (index: number) => void
  onSegmentLeave: () => void
  hoveredIndex: number | null
}) => {
  const segmentsWithAngles = calculateAngles(data)
  const segments = segmentsWithAngles.map((entry, index) => {
    const { startAngle, endAngle, sliceAngle } = entry
    
    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180
    
    const isHovered = hoveredIndex === index
    const radius = isHovered ? outerRadius + 8 : outerRadius
    
    // Calculate path for the pie slice
    const largeArcFlag = sliceAngle > 180 ? 1 : 0
    
    const x1 = centerX + innerRadius * Math.cos(startAngleRad)
    const y1 = centerY + innerRadius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(startAngleRad)
    const y2 = centerY + radius * Math.sin(startAngleRad)
    
    const x3 = centerX + radius * Math.cos(endAngleRad)
    const y3 = centerY + radius * Math.sin(endAngleRad)
    const x4 = centerX + innerRadius * Math.cos(endAngleRad)
    const y4 = centerY + innerRadius * Math.sin(endAngleRad)
    
    const pathData = [
      `M ${x1} ${y1}`,
      `L ${x2} ${y2}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
      `L ${x4} ${y4}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
      'Z'
    ].join(' ')
    
    return {
      ...entry,
      pathData,
      startAngle,
      endAngle,
      color: COLORS[entry.bucket as keyof typeof COLORS]
    }
  })
  
  return (
    <g>
      {segments.map((segment, index) => (
        <path
          key={`segment-${index}`}
          d={segment.pathData}
          fill={segment.color}
          stroke="white"
          strokeWidth="1"
          opacity={hoveredIndex === index ? 0.8 : 1}
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => onSegmentHover(index)}
          onMouseLeave={onSegmentLeave}
        />
      ))}
    </g>
  )
}

const PieTooltip = ({ data, isVisible }: { data: any; isVisible: boolean }) => {
  if (!isVisible || !data) return null
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
      <p className="text-sm font-medium text-gray-900">{data.bucket}</p>
      <p className="text-xs text-gray-600">Tokens: {data.token_count}</p>
    </div>
  )
}

const BubbleTooltip = ({ token }: { token: Token }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs z-50">
      <p className="font-medium">{token.symbol.toUpperCase()}</p>
      <p>Market Cap: {formatMarketCap(token.marketcap)}</p>
    </div>
  )
}

export default function MarketCapDistribution({ authorHandle }: { authorHandle: string }) {
  // State
  const [marketCapData, setMarketCapData] = useState<MarketCapData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hoveredToken, setHoveredToken] = useState<Token | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [physicsBubbles, setPhysicsBubbles] = useState<PhysicsBubble[]>([])
  const [pieTooltipData, setPieTooltipData] = useState<any>(null)

  // Refs for Matter.js
  const engineRef = useRef<Matter.Engine | null>(null)
  const wallBodiesRef = useRef<Matter.Body[]>([])
  const bubbleBodiesRef = useRef<Matter.Body[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)

  // Fetch data
  useEffect(() => {
    const fetchMarketCapData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://api.cred.buzz/user/first-call-marketcap?author_handle=${authorHandle}`)
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }
        
        const data: ApiResponse = await response.json()
        setMarketCapData(data.result)
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

  // Calculate sectors using exact same logic as custom pie chart
  const calculateSectors = useCallback((): CalculatedSector[] => {
    if (!marketCapData) return []

    const pieChartData = marketCapData.buckets.map(b => ({ ...b, value: b.token_count }))
    const sectorsWithAngles = calculateAngles(pieChartData)

    return sectorsWithAngles.map((data) => ({
      bucket: data.bucket,
      startAngle: data.startAngle,
      endAngle: data.endAngle,
      color: COLORS[data.bucket as keyof typeof COLORS],
      tokens: data.tokens
    }))
  }, [marketCapData])

  // Create compartment walls
  const createCompartmentWalls = useCallback((sectors: CalculatedSector[]): Matter.Body[] => {
    const centerX = CONTAINER_WIDTH / 2
    const centerY = CONTAINER_HEIGHT / 2
    const innerRadius = PIE_OUTER_RADIUS + 5
    const walls: Matter.Body[] = []

    // Create rectangular boundary walls
    const wallThickness = 20
    
    // Top wall
    walls.push(Matter.Bodies.rectangle(CONTAINER_WIDTH / 2, -wallThickness / 2, CONTAINER_WIDTH, wallThickness, {
      isStatic: true,
      render: { visible: false }
    }))
    
    // Bottom wall
    walls.push(Matter.Bodies.rectangle(CONTAINER_WIDTH / 2, CONTAINER_HEIGHT + wallThickness / 2, CONTAINER_WIDTH, wallThickness, {
      isStatic: true,
      render: { visible: false }
    }))
    
    // Left wall
    walls.push(Matter.Bodies.rectangle(-wallThickness / 2, CONTAINER_HEIGHT / 2, wallThickness, CONTAINER_HEIGHT, {
      isStatic: true,
      render: { visible: false }
    }))
    
    // Right wall
    walls.push(Matter.Bodies.rectangle(CONTAINER_WIDTH + wallThickness / 2, CONTAINER_HEIGHT / 2, wallThickness, CONTAINER_HEIGHT, {
      isStatic: true,
      render: { visible: false }
    }))

    // Create radial walls between sectors
    sectors.forEach((sector, index) => {
      const startAngleRad = (sector.startAngle * Math.PI) / 180
      
      // Calculate line intersection with container boundaries for wall length
      const cos = Math.cos(startAngleRad)
      const sin = Math.sin(startAngleRad)
      
      let endX, endY
      if (Math.abs(cos) > Math.abs(sin)) {
        if (cos > 0) {
          endX = CONTAINER_WIDTH
          endY = centerY + (CONTAINER_WIDTH - centerX) * Math.tan(startAngleRad)
        } else {
          endX = 0
          endY = centerY + (0 - centerX) * Math.tan(startAngleRad)
        }
      } else {
        if (sin > 0) {
          endY = CONTAINER_HEIGHT
          endX = centerX + (CONTAINER_HEIGHT - centerY) / Math.tan(startAngleRad)
        } else {
          endY = 0
          endX = centerX + (0 - centerY) / Math.tan(startAngleRad)
        }
      }
      
      // Clamp to container bounds
      endX = Math.max(0, Math.min(CONTAINER_WIDTH, endX))
      endY = Math.max(0, Math.min(CONTAINER_HEIGHT, endY))
      
      // Calculate wall position and length
      const wallLength = Math.sqrt((endX - centerX) ** 2 + (endY - centerY) ** 2) - innerRadius
      const wallCenterX = centerX + (innerRadius + wallLength / 2) * cos
      const wallCenterY = centerY + (innerRadius + wallLength / 2) * sin
      
      const wall = Matter.Bodies.rectangle(wallCenterX, wallCenterY, 4, wallLength, {
        isStatic: true,
        angle: startAngleRad,
        render: { visible: false }
      })
      walls.push(wall)
    })

    // Create inner circular boundary (around the pie chart)
    const numInnerSegments = 16
    for (let i = 0; i < numInnerSegments; i++) {
      const angle1 = (i * 2 * Math.PI) / numInnerSegments
      const angle2 = ((i + 1) * 2 * Math.PI) / numInnerSegments
      const x1 = centerX + innerRadius * Math.cos(angle1)
      const y1 = centerY + innerRadius * Math.sin(angle1)
      const x2 = centerX + innerRadius * Math.cos(angle2)
      const y2 = centerY + innerRadius * Math.sin(angle2)
      
      const segmentX = (x1 + x2) / 2
      const segmentY = (y1 + y2) / 2
      const segmentLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
      const segmentAngle = Math.atan2(y2 - y1, x2 - x1)
      
      const innerWall = Matter.Bodies.rectangle(segmentX, segmentY, segmentLength, 4, {
        isStatic: true,
        angle: segmentAngle,
        render: { visible: false }
      })
      walls.push(innerWall)
    }

    return walls
  }, [])

  // Create bubble bodies with max 20 bubbles per sector and better distribution
  const createBubbleBodies = useCallback((sectors: CalculatedSector[]): Matter.Body[] => {
    const centerX = CONTAINER_WIDTH / 2
    const centerY = CONTAINER_HEIGHT / 2
    const bubbles: Matter.Body[] = []

    sectors.forEach((sector) => {
      // Limit to 20 bubbles per sector, prioritize by market cap
      const maxBubbles = Math.min(20, sector.tokens.length)
      const sortedTokens = [...sector.tokens]
        .sort((a, b) => b.marketcap - a.marketcap) // Sort by market cap descending
        .slice(0, maxBubbles)

      sortedTokens.forEach((token, index) => {
        const size = getBubbleSize(token.marketcap)
        const radius = size / 2

        // Calculate sector boundaries
        const sectorStartAngle = (sector.startAngle * Math.PI) / 180
        const sectorEndAngle = (sector.endAngle * Math.PI) / 180
        const sectorSpan = sectorEndAngle - sectorStartAngle

        // Distribute bubbles in a grid-like pattern within the sector
        const bubblesPerRow = Math.ceil(Math.sqrt(maxBubbles))
        const row = Math.floor(index / bubblesPerRow)
        const col = index % bubblesPerRow
        const totalRows = Math.ceil(maxBubbles / bubblesPerRow)

        // Calculate position with better distribution
        const angleProgress = (col + 0.5) / bubblesPerRow
        const angle = sectorStartAngle + sectorSpan * angleProgress

        // Distance from center - create layers
        const minDistance = PIE_OUTER_RADIUS + 15
        const maxDistance = Math.min(
          CONTAINER_WIDTH / 2 - 30,  // Stay away from container edges
          CONTAINER_HEIGHT / 2 - 30
        )
        const distanceProgress = (row + 0.5) / Math.max(totalRows, 1)
        const distance = minDistance + (maxDistance - minDistance) * distanceProgress

        // Add some randomness to avoid perfect grid
        const angleJitter = (Math.random() - 0.5) * (sectorSpan * 0.1)
        const distanceJitter = (Math.random() - 0.5) * 20

        const finalAngle = angle + angleJitter
        const finalDistance = Math.max(minDistance, distance + distanceJitter)

        const x = centerX + finalDistance * Math.cos(finalAngle)
        const y = centerY + finalDistance * Math.sin(finalAngle)

        // Ensure bubbles stay within container bounds
        const constrainedX = Math.max(radius + 5, Math.min(CONTAINER_WIDTH - radius - 5, x))
        const constrainedY = Math.max(radius + 5, Math.min(CONTAINER_HEIGHT - radius - 5, y))

        const bubble = Matter.Bodies.circle(constrainedX, constrainedY, radius, {
          restitution: 0.6,
          frictionAir: 0.02,
          density: 0.001,
          render: { visible: false }
        })

        // Add custom properties
        ;(bubble as any).tokenData = {
          symbol: token.symbol,
          marketcap: token.marketcap,
          bucket: sector.bucket,
          size: size
        }

        // Apply gentle initial random force
        const forceX = (Math.random() - 0.5) * 0.00005
        const forceY = (Math.random() - 0.5) * 0.00005
        Matter.Body.applyForce(bubble, bubble.position, { x: forceX, y: forceY })

        bubbles.push(bubble)
      })
    })

    return bubbles
  }, [])

  // Physics engine setup and cleanup
  useEffect(() => {
    if (!marketCapData) return

    // Create engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0 }
    })
    engineRef.current = engine

    const sectors = calculateSectors()

    // Create walls
    const walls = createCompartmentWalls(sectors)
    wallBodiesRef.current = walls
    Matter.World.add(engine.world, walls)

    // Create bubbles
    const bubbles = createBubbleBodies(sectors)
    bubbleBodiesRef.current = bubbles
    Matter.World.add(engine.world, bubbles)

    // Animation loop to update React state with physics positions
    const updatePhysics = () => {
      if (engineRef.current) {
        Matter.Engine.update(engineRef.current, 16.666) // ~60fps
      }
      
      const updatedBubbles: PhysicsBubble[] = bubbles.map((bubble) => {
        const tokenData = (bubble as any).tokenData
        return {
          id: `${tokenData.symbol}-${tokenData.bucket}`,
          symbol: tokenData.symbol,
          marketcap: tokenData.marketcap,
          bucket: tokenData.bucket,
          x: bubble.position.x,
          y: bubble.position.y,
          size: tokenData.size,
          bodyId: bubble.id
        }
      })
      setPhysicsBubbles(updatedBubbles)
      animationFrameRef.current = requestAnimationFrame(updatePhysics)
    }
    updatePhysics()

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false)
        Matter.Engine.clear(engineRef.current)
      }
    }
  }, [marketCapData, calculateSectors, createCompartmentWalls, createBubbleBodies])

  // Event handlers
  const handleBubbleHover = (e: React.MouseEvent, bubble: PhysicsBubble) => {
    setHoveredToken({
      symbol: bubble.symbol,
      marketcap: bubble.marketcap
    })
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }

  const handleBubbleLeave = () => {
    setHoveredToken(null)
  }

  const handlePieEnter = (index: number) => {
    setActiveIndex(index)
    setPieTooltipData(pieChartData[index])
  }

  const handlePieLeave = () => {
    setActiveIndex(null)
    setPieTooltipData(null)
  }

  // Loading and error states
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

  const sectors = calculateSectors()

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Market Cap Distribution</h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-gray-500">
            Avg: {formatMarketCap(marketCapData.overall_avg_marketcap)} | 
            Median: {formatMarketCap(marketCapData.overall_median_marketcap)}
          </p>
        </div>
      </div>

      {/* Visualization Container */}
      <div className="relative mx-auto border border-gray-200 rounded-lg" style={{ width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT }}>
        {/* Sector dividing lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {sectors.filter(sector => sector.startAngle !== undefined && sector.endAngle !== undefined).map((sector, index) => {
            const centerX = CONTAINER_WIDTH / 2
            const centerY = CONTAINER_HEIGHT / 2
            
            // Helper function to calculate line intersection with container (robust version)
            const calculateLineEnd = (angleRad: number) => {
              // Normalize angle to avoid floating point issues
              const normalizedAngle = ((angleRad % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
              const cos = Math.cos(normalizedAngle)
              const sin = Math.sin(normalizedAngle)
              
              let endX, endY
              
              // Use a small epsilon to avoid division by zero
              const epsilon = 1e-10
              
              // Calculate intersections with all four walls and pick the closest valid one
              const intersections = []
              
              // Right wall (x = CONTAINER_WIDTH)
              if (Math.abs(cos) > epsilon) {
                const t = (CONTAINER_WIDTH - centerX) / cos
                if (t > 0) {
                  const y = centerY + t * sin
                  if (y >= 0 && y <= CONTAINER_HEIGHT) {
                    intersections.push({ x: CONTAINER_WIDTH, y, distance: t })
                  }
                }
              }
              
              // Left wall (x = 0)
              if (Math.abs(cos) > epsilon) {
                const t = (0 - centerX) / cos
                if (t > 0) {
                  const y = centerY + t * sin
                  if (y >= 0 && y <= CONTAINER_HEIGHT) {
                    intersections.push({ x: 0, y, distance: t })
                  }
                }
              }
              
              // Bottom wall (y = CONTAINER_HEIGHT)
              if (Math.abs(sin) > epsilon) {
                const t = (CONTAINER_HEIGHT - centerY) / sin
                if (t > 0) {
                  const x = centerX + t * cos
                  if (x >= 0 && x <= CONTAINER_WIDTH) {
                    intersections.push({ x, y: CONTAINER_HEIGHT, distance: t })
                  }
                }
              }
              
              // Top wall (y = 0)
              if (Math.abs(sin) > epsilon) {
                const t = (0 - centerY) / sin
                if (t > 0) {
                  const x = centerX + t * cos
                  if (x >= 0 && x <= CONTAINER_WIDTH) {
                    intersections.push({ x, y: 0, distance: t })
                  }
                }
              }
              
              // Find the closest intersection
              if (intersections.length > 0) {
                const closest = intersections.reduce((min, curr) => 
                  curr.distance < min.distance ? curr : min
                )
                endX = closest.x
                endY = closest.y
              } else {
                // Fallback: just extend in the direction of the angle
                const distance = Math.max(CONTAINER_WIDTH, CONTAINER_HEIGHT)
                endX = centerX + distance * cos
                endY = centerY + distance * sin
                // Clamp to bounds
                endX = Math.max(0, Math.min(CONTAINER_WIDTH, endX))
                endY = Math.max(0, Math.min(CONTAINER_HEIGHT, endY))
              }
              
              return { endX, endY, cos, sin }
            }
            
            // Draw start angle line for each sector
            // Ensure angle is properly normalized and matches pie chart calculation
            const startAngleRad = (sector.startAngle * Math.PI) / 180
            const startLine = calculateLineEnd(startAngleRad)
            
            return (
              <line 
                key={`sector-line-${index}`}
                x1={centerX} 
                y1={centerY} 
                x2={startLine.endX}
                y2={startLine.endY}
                stroke="#e5e7eb"
                strokeWidth="2"
                opacity="0.8" 
              />
            )
          })}
          
          {/* Inner circle boundary */}
                     <circle
             cx={CONTAINER_WIDTH / 2}
             cy={CONTAINER_HEIGHT / 2}
             r={PIE_OUTER_RADIUS + 5}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            opacity="0.5"
          />
          

        </svg>
        
        {/* Custom Pie chart */}
        <svg 
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" 
          style={{ width: 200, height: 200, zIndex: 2 }}
          viewBox="0 0 200 200"
        >
          <CustomPieChart
            data={pieChartData}
            centerX={100}
            centerY={100}
            innerRadius={PIE_INNER_RADIUS}
            outerRadius={PIE_OUTER_RADIUS}
            onSegmentHover={handlePieEnter}
            onSegmentLeave={handlePieLeave}
            hoveredIndex={activeIndex}
          />
        </svg>

        {/* Physics bubbles */}
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {physicsBubbles.map((bubble) => (
            <div
              key={bubble.id}
              className="absolute rounded-full flex items-center justify-center text-xs font-semibold text-white uppercase cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200"
              style={{
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                left: `${bubble.x}px`,
                top: `${bubble.y}px`,
                backgroundColor: COLORS[bubble.bucket as keyof typeof COLORS],
                transform: 'translate(-50%, -50%)',
                opacity: hoveredToken?.symbol === bubble.symbol ? 1 : 0.85,
                border: hoveredToken?.symbol === bubble.symbol ? '2px solid white' : '1px solid rgba(255,255,255,0.3)',
                zIndex: hoveredToken?.symbol === bubble.symbol ? 10 : 5,
                scale: hoveredToken?.symbol === bubble.symbol ? '1.1' : '1',
              }}
              onMouseEnter={(e) => handleBubbleHover(e, bubble)}
              onMouseLeave={handleBubbleLeave}
              title={`${bubble.symbol.toUpperCase()} - ${formatMarketCap(bubble.marketcap)}`}
            >
              {bubble.symbol.substring(0, bubble.size > 30 ? 4 : 3).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-x-4 gap-y-2 mt-4 flex-wrap">
        {Object.entries(COLORS).map(([bucket, color]) => (
          <div key={bucket} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs font-medium text-gray-600">{bucket}</span>
          </div>
        ))}
      </div>

      {/* Bubble Tooltip */}
      {hoveredToken && (
        <div 
          className="fixed z-[1000] pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 15}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translateY(-100%)'
          }}
        >
          <BubbleTooltip token={hoveredToken} />
        </div>
      )}
      
      {/* Pie Chart Tooltip */}
      {pieTooltipData && (
        <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
          <PieTooltip data={pieTooltipData} isVisible={!!pieTooltipData} />
        </div>
      )}
    </div>
  )
} 