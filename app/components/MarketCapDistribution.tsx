"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Matter from "matter-js"
// Removed Recharts imports - using custom pie chart

// Type definitions
interface Token {
  symbol: string
  marketcap: number
  icon?: string
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
  icon?: string
}

interface CalculatedSector {
  bucket: string
  startAngle: number
  endAngle: number
  color: string
  tokens: Token[]
}

interface TokenData {
  id: string
  symbol: string
  name: string
  market_cap_usd: number | null
  current_price_usd: number | null
  profile_image_url: string | null
  sector?: string // Added sector for potential future use
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

const getBubbleSize = (marketcap: number, sectorInfo?: {
  sectorWidth: number, 
  sectorArea: number, 
  totalBubbles: number, 
  bubbleIndex: number,
  isLargestInSector: boolean,
  distributionTier: number // 0 = largest tier, 1 = medium, 2 = small
}) => {
  // Base size from market cap
  const marketCapSize = Math.max(12, Math.min(50, Math.log10(marketcap) * 4))
  
  if (!sectorInfo) return marketCapSize
  
  const { sectorWidth, sectorArea, totalBubbles, bubbleIndex, isLargestInSector, distributionTier } = sectorInfo
  
  // Calculate space-filling size more aggressively
  // Use higher fill factor to ensure better coverage
  const totalBubbleArea = sectorArea * 0.7 // Target 70% area coverage
  const averageBubbleArea = totalBubbleArea / totalBubbles
  const baseRadius = Math.sqrt(averageBubbleArea / Math.PI)
  
  // Tier-based size distribution for better space filling
  let tierMultiplier = 1.0
  if (distributionTier === 0) { // Large bubbles (top 30%)
    tierMultiplier = 1.4
  } else if (distributionTier === 1) { // Medium bubbles (next 40%)
    tierMultiplier = 1.0
  } else { // Small bubbles (remaining 30%)
    tierMultiplier = 0.7
  }
  
  // Market cap ranking within tier
  const tierPosition = bubbleIndex % Math.ceil(totalBubbles / 3)
  const tierSize = Math.ceil(totalBubbles / 3)
  const positionMultiplier = 1 + (1 - tierPosition / Math.max(tierSize - 1, 1)) * 0.3
  
  // Extra bonus for the absolute largest
  const largestBonus = isLargestInSector ? 1.2 : 1.0
  
  // Calculate final size prioritizing space filling
  const spaceFillSize = baseRadius * 2 * tierMultiplier * positionMultiplier * largestBonus
  const hybridSize = (marketCapSize * 0.2) + (spaceFillSize * 0.8) // 20% market cap, 80% space filling
  
  // More generous constraints for better space filling
  const maxSizeForWidth = sectorWidth * 0.5 // Max 50% of sector width
  const finalSize = Math.max(10, Math.min(maxSizeForWidth, hybridSize, 65))
  
  return finalSize
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
  const totalValue = data.reduce((sum, entry) => sum + entry.value, 0)
  
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
    
    // Calculate percentage
    const percentage = totalValue > 0 ? ((entry.value / totalValue) * 100).toFixed(1) : '0.0'
    
    // Calculate label position (middle of the segment, at 70% of radius)
    const labelAngle = (startAngle + endAngle) / 2
    const labelAngleRad = (labelAngle * Math.PI) / 180
    const labelRadius = (innerRadius + outerRadius) * 0.7
    const labelX = centerX + labelRadius * Math.cos(labelAngleRad)
    const labelY = centerY + labelRadius * Math.sin(labelAngleRad)

    return {
      ...entry,
      pathData,
      startAngle,
      endAngle,
      color: COLORS[entry.bucket as keyof typeof COLORS],
      percentage,
      labelX,
      labelY,
      labelAngle
    }
  })
  
  return (
    <g>
      {segments.map((segment, index) => (
        <g key={`segment-group-${index}`}>
          <path
            d={segment.pathData}
            fill={segment.color}
            stroke="white"
            strokeWidth="1"
            opacity={hoveredIndex === index ? 0.8 : 1}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => onSegmentHover(index)}
            onMouseLeave={onSegmentLeave}
          />
          {/* Percentage label */}
          {parseFloat(segment.percentage) > 5 && ( // Only show percentage if slice is larger than 5%
            <text
              x={segment.labelX}
              y={segment.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="600"
              fill="white"
              style={{ pointerEvents: 'none' }}
            >
              {segment.percentage}%
            </text>
          )}
        </g>
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

// Helper function for fetching with retry (duplicate in both files for now, could be moved to a shared utility later)
async function fetchWithRetry<T>(url: string, options?: RequestInit, attempt = 0, maxRetries = 3, retryDelay = 1000): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Invalid content type: ${contentType}`);
    }

    return await response.json() as T;

  } catch (error) {
    console.error(`Fetch failed for ${url} (attempt ${attempt + 1}):`, error);

    if (attempt < maxRetries) {
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, attempt + 1, maxRetries, retryDelay);
    } else {
      throw new Error(`Failed to fetch ${url} after ${maxRetries} retries: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
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
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use fetchWithRetry
        const data = await fetchWithRetry<ApiResponse>(
          `https://api.cred.buzz/user/first-call-marketcap?author_handle=${authorHandle}`
        )

        setMarketCapData(data.result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (authorHandle) {
      fetchData()
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

    // Create impenetrable circular outer boundary
    const outerRadius = Math.min(CONTAINER_WIDTH, CONTAINER_HEIGHT) / 2 - 10
    const numOuterSegments = 36 // More segments for smoother circular boundary
    
    for (let i = 0; i < numOuterSegments; i++) {
      const angle1 = (i * 2 * Math.PI) / numOuterSegments
      const angle2 = ((i + 1) * 2 * Math.PI) / numOuterSegments
      const x1 = centerX + outerRadius * Math.cos(angle1)
      const y1 = centerY + outerRadius * Math.sin(angle1)
      const x2 = centerX + outerRadius * Math.cos(angle2)
      const y2 = centerY + outerRadius * Math.sin(angle2)
      
      const segmentX = (x1 + x2) / 2
      const segmentY = (y1 + y2) / 2
      const segmentLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
      const segmentAngle = Math.atan2(y2 - y1, x2 - x1)
      
      // Main outer wall
      const outerWall1 = Matter.Bodies.rectangle(segmentX, segmentY, segmentLength + 4, 20, {
        isStatic: true,
        angle: segmentAngle,
        render: { visible: false },
        frictionStatic: 1.0,
        friction: 1.0,
        restitution: 0.95
      })
      walls.push(outerWall1)
      
      // Inner backup wall
      const innerBackupX = centerX + (outerRadius - 8) * Math.cos((angle1 + angle2) / 2)
      const innerBackupY = centerY + (outerRadius - 8) * Math.sin((angle1 + angle2) / 2)
      const outerWall2 = Matter.Bodies.rectangle(innerBackupX, innerBackupY, segmentLength + 2, 16, {
        isStatic: true,
        angle: segmentAngle,
        render: { visible: false },
        frictionStatic: 1.0,
        friction: 1.0,
        restitution: 0.95
      })
      walls.push(outerWall2)
    }

    // Create radial walls between sectors using robust intersection calculation
    sectors.forEach((sector, index) => {
      const startAngleRad = (sector.startAngle * Math.PI) / 180
      
              // Calculate intersection with circular boundary
        const calculateWallEnd = (angleRad: number) => {
          const normalizedAngle = ((angleRad % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
          const cos = Math.cos(normalizedAngle)
          const sin = Math.sin(normalizedAngle)
          
          // For circular boundary, intersection is simply at the outer radius
          const x = centerX + outerRadius * cos
          const y = centerY + outerRadius * sin
          
          return { x, y, cos, sin }
        }
      
      const wallEnd = calculateWallEnd(startAngleRad)
      
              // Create ultra-dense wall segments for absolute boundary enforcement
        const totalLength = outerRadius - innerRadius
        const numSegments = Math.max(20, Math.ceil(totalLength / 3)) // More segments, every 3px
        const segmentSize = totalLength / numSegments
      
      for (let i = 0; i < numSegments; i++) {
        const segmentStart = innerRadius + (i * segmentSize)
        const segmentCenter = segmentStart + (segmentSize / 2)
        
        const wallCenterX = centerX + segmentCenter * wallEnd.cos
        const wallCenterY = centerY + segmentCenter * wallEnd.sin
        
        // Create triple-layered walls for impenetrable barriers
        // Main wall
        const wall1 = Matter.Bodies.rectangle(wallCenterX, wallCenterY, 20, segmentSize + 4, {
          isStatic: true,
          angle: startAngleRad,
          render: { visible: false },
          frictionStatic: 1.0,
          friction: 1.0,
          restitution: 0.95
        })
        walls.push(wall1)
        
        // Left side wall for extra protection
        const wall2 = Matter.Bodies.rectangle(
          wallCenterX - 8 * Math.cos(startAngleRad + Math.PI / 2), 
          wallCenterY - 8 * Math.sin(startAngleRad + Math.PI / 2), 
          16, segmentSize + 2, {
          isStatic: true,
          angle: startAngleRad,
          render: { visible: false },
          frictionStatic: 1.0,
          friction: 1.0,
          restitution: 0.95
        })
        walls.push(wall2)
        
        // Right side wall for extra protection
        const wall3 = Matter.Bodies.rectangle(
          wallCenterX + 8 * Math.cos(startAngleRad + Math.PI / 2), 
          wallCenterY + 8 * Math.sin(startAngleRad + Math.PI / 2), 
          16, segmentSize + 2, {
          isStatic: true,
          angle: startAngleRad,
          render: { visible: false },
          frictionStatic: 1.0,
          friction: 1.0,
          restitution: 0.95
        })
        walls.push(wall3)
      }
      
      // Add perpendicular reinforcement walls along the entire length
      for (let i = 0; i < numSegments; i += 2) {
        const segmentStart = innerRadius + (i * segmentSize)
        const segmentCenter = segmentStart + (segmentSize / 2)
        
        const wallCenterX = centerX + segmentCenter * wallEnd.cos
        const wallCenterY = centerY + segmentCenter * wallEnd.sin
        
        // Perpendicular reinforcement wall
        const perpWall = Matter.Bodies.rectangle(wallCenterX, wallCenterY, 16, 24, {
          isStatic: true,
          angle: startAngleRad + Math.PI / 2,
          render: { visible: false },
          frictionStatic: 1.0,
          friction: 1.0,
          restitution: 0.95
        })
        walls.push(perpWall)
      }
    })

    // Create reinforced inner circular boundary (around the pie chart)
    const numInnerSegments = 24
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
      
      // Main inner wall
      const innerWall1 = Matter.Bodies.rectangle(segmentX, segmentY, segmentLength + 2, 12, {
        isStatic: true,
        angle: segmentAngle,
        render: { visible: false },
        frictionStatic: 1.0,
        friction: 1.0,
        restitution: 0.95
      })
      walls.push(innerWall1)
      
      // Backup inner wall
      const backupX = centerX + (innerRadius + 4) * Math.cos((angle1 + angle2) / 2)
      const backupY = centerY + (innerRadius + 4) * Math.sin((angle1 + angle2) / 2)
      const innerWall2 = Matter.Bodies.rectangle(backupX, backupY, segmentLength, 8, {
        isStatic: true,
        angle: segmentAngle,
        render: { visible: false },
        frictionStatic: 1.0,
        friction: 1.0,
        restitution: 0.95
      })
      walls.push(innerWall2)
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

      // Calculate sector dimensions for dynamic bubble sizing
      const sectorStartAngle = (sector.startAngle * Math.PI) / 180
      const sectorEndAngle = (sector.endAngle * Math.PI) / 180
      const sectorSpan = sectorEndAngle - sectorStartAngle
      
      // Calculate sector area and width for space-filling
      const minDistance = PIE_OUTER_RADIUS + 20
      const maxDistance = Math.min(CONTAINER_WIDTH, CONTAINER_HEIGHT) / 2 - 30
      const avgDistance = (minDistance + maxDistance) / 2
      const sectorWidthAtMiddle = avgDistance * sectorSpan
      const sectorArea = (sectorSpan / 2) * (maxDistance * maxDistance - minDistance * minDistance)
      
      // Find the largest market cap in this sector for bonus sizing
      const largestMarketCap = Math.max(...sortedTokens.map(t => t.marketcap))

      sortedTokens.forEach((token, index) => {
        const isLargestInSector = token.marketcap === largestMarketCap
        
        // Calculate distribution tier for better size variety
        const distributionTier = Math.floor(index / Math.ceil(maxBubbles / 3))
        
        const size = getBubbleSize(token.marketcap, {
          sectorWidth: sectorWidthAtMiddle,
          sectorArea: sectorArea,
          totalBubbles: maxBubbles,
          bubbleIndex: index,
          isLargestInSector: isLargestInSector,
          distributionTier: Math.min(distributionTier, 2) // Cap at 2
        })
        const radius = size / 2

        // Calculate safe boundaries with strict margins to prevent boundary crossing
        const radiusMargin = radius / avgDistance // Angular margin based on bubble size
        const angleMargin = Math.max(radiusMargin * 1.5, sectorSpan * 0.08, 0.08) // Larger margin based on bubble size
        const safeStartAngle = sectorStartAngle + angleMargin
        const safeEndAngle = sectorEndAngle - angleMargin
        const safeSpan = Math.max(0, safeEndAngle - safeStartAngle) // Ensure positive span

        // Use hexagonal packing pattern for better space utilization
        const packingEfficiency = 0.9 // 90% of theoretical max
        const idealBubblesPerRow = Math.ceil(Math.sqrt(maxBubbles * packingEfficiency))
        
        // Stagger alternate rows for hexagonal packing
        const row = Math.floor(index / idealBubblesPerRow)
        const col = index % idealBubblesPerRow
        const totalRows = Math.ceil(maxBubbles / idealBubblesPerRow)
        const isStaggeredRow = row % 2 === 1
        
        // Adjust column position for staggered rows
        const adjustedCol = isStaggeredRow ? col + 0.5 : col
        const adjustedBubblesPerRow = isStaggeredRow ? idealBubblesPerRow + 1 : idealBubblesPerRow

        // Calculate position with hexagonal distribution for better coverage
        const angleProgress = safeSpan > 0 ? adjustedCol / Math.max(adjustedBubblesPerRow, 1) : 0.5
        const angle = safeStartAngle + safeSpan * angleProgress

        // Create strict distance constraints for circular boundary
        const safetyBuffer = radius + 8 // Extra buffer beyond bubble radius
        const minDistance = PIE_OUTER_RADIUS + 20 + safetyBuffer
        
        // For circular boundary, max distance is simply the outer radius minus safety buffer
        const circularOuterRadius = Math.min(CONTAINER_WIDTH, CONTAINER_HEIGHT) / 2 - 10
        const maxDistance = circularOuterRadius - safetyBuffer

        // Distribute more evenly across the radial space
        const numDistanceLayers = Math.max(3, Math.ceil(totalRows * 1.2))
        const distanceLayer = row % numDistanceLayers
        const distanceProgress = (distanceLayer + 0.5) / numDistanceLayers
        const distance = minDistance + (Math.max(0, maxDistance - minDistance)) * distanceProgress

        // Add controlled randomness but ensure it doesn't violate boundaries
        const maxSafeAngleJitter = Math.min(safeSpan * 0.03, 0.03) // Reduced jitter to stay within bounds
        const angleJitter = (Math.random() - 0.5) * maxSafeAngleJitter
        const maxSafeDistanceJitter = Math.min(10, (maxDistance - minDistance) * 0.08) // Reduced distance jitter
        const distanceJitter = (Math.random() - 0.5) * maxSafeDistanceJitter

        // Ensure final angle stays within safe boundaries
        const tentativeAngle = angle + angleJitter
        const finalAngle = Math.max(safeStartAngle, Math.min(safeEndAngle, tentativeAngle))
        const finalDistance = Math.max(minDistance, Math.min(maxDistance, distance + distanceJitter))

        const x = centerX + finalDistance * Math.cos(finalAngle)
        const y = centerY + finalDistance * Math.sin(finalAngle)

        // Strict circular boundary validation
        const strictBuffer = radius + 5
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
        const maxAllowedDistance = circularOuterRadius - strictBuffer
        
        let constrainedX = x
        let constrainedY = y
        
        // If bubble exceeds circular boundary, pull it back to the boundary
        if (distanceFromCenter > maxAllowedDistance) {
          const scale = maxAllowedDistance / distanceFromCenter
          constrainedX = centerX + (x - centerX) * scale
          constrainedY = centerY + (y - centerY) * scale
        }
        
        // Additional sector boundary check - verify bubble doesn't cross sector lines
        const bubbleAngle = Math.atan2(constrainedY - centerY, constrainedX - centerX)
        const normalizedBubbleAngle = ((bubbleAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
        const normalizedSectorStart = ((sectorStartAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
        const normalizedSectorEnd = ((sectorEndAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
        
        // Handle angle wrapping around 0/2π
        let isInSector = false
        if (normalizedSectorStart <= normalizedSectorEnd) {
          isInSector = normalizedBubbleAngle >= normalizedSectorStart && normalizedBubbleAngle <= normalizedSectorEnd
        } else {
          // Sector crosses 0/2π boundary
          isInSector = normalizedBubbleAngle >= normalizedSectorStart || normalizedBubbleAngle <= normalizedSectorEnd
        }
        
        // If bubble is outside sector, move it to sector center as fallback
        let finalX = constrainedX
        let finalY = constrainedY
        if (!isInSector) {
          const sectorCenterAngle = (sectorStartAngle + sectorEndAngle) / 2
          const safeDistance = Math.min(finalDistance, (minDistance + maxDistance) / 2)
          finalX = centerX + safeDistance * Math.cos(sectorCenterAngle)
          finalY = centerY + safeDistance * Math.sin(sectorCenterAngle)
          
          // Re-apply circular boundary check
          const fallbackDistanceFromCenter = Math.sqrt((finalX - centerX) ** 2 + (finalY - centerY) ** 2)
          if (fallbackDistanceFromCenter > maxAllowedDistance) {
            const scale = maxAllowedDistance / fallbackDistanceFromCenter
            finalX = centerX + (finalX - centerX) * scale
            finalY = centerY + (finalY - centerY) * scale
          }
        }

        const bubble = Matter.Bodies.circle(finalX, finalY, radius, {
          restitution: 0.8 + (Math.random() * 0.15), // 0.8 to 0.95 - high bounce with variation
          frictionAir: 0.01 + (Math.random() * 0.01), // 0.01 to 0.02 - low air resistance for liveliness
          friction: 0.3,
          density: 0.0008 + (size / 1000), // Slightly variable density based on size
          render: { visible: false }
        })

        // Add custom properties
        ;(bubble as any).tokenData = {
          symbol: token.symbol,
          marketcap: token.marketcap,
          bucket: sector.bucket,
          size: size,
          icon: token.icon
        }

        // Apply more dynamic initial forces for liveliness
        const forceMultiplier = 0.0001 + (size / 50000) // Larger bubbles get more force
        const forceX = (Math.random() - 0.5) * forceMultiplier
        const forceY = (Math.random() - 0.5) * forceMultiplier
        Matter.Body.applyForce(bubble, bubble.position, { x: forceX, y: forceY })
        
        // Add slight rotational force for more natural movement
        const torque = (Math.random() - 0.5) * 0.00001
        Matter.Body.setAngularVelocity(bubble, torque)

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
    let frameCount = 0
    const updatePhysics = () => {
      if (engineRef.current) {
        Matter.Engine.update(engineRef.current, 16.666) // ~60fps
        
        // Add periodic gentle forces and boundary enforcement (every 3 seconds)
        frameCount++
        if (frameCount % 180 === 0) {
          bubbles.forEach((bubble) => {
            const velocity = bubble.velocity
            const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
            
            // If bubble is moving slowly, give it a gentle nudge
            if (speed < 0.1) {
              const tokenData = (bubble as any).tokenData
              const size = tokenData.size
              const nudgeForce = 0.00005 + (size / 100000)
              const randomAngle = Math.random() * 2 * Math.PI
              
              Matter.Body.applyForce(bubble, bubble.position, {
                x: Math.cos(randomAngle) * nudgeForce,
                y: Math.sin(randomAngle) * nudgeForce
              })
            }
          })
        }
        
        // Continuous boundary enforcement (every frame)
        bubbles.forEach((bubble) => {
          const tokenData = (bubble as any).tokenData
          const radius = tokenData.size / 2
          const centerX = CONTAINER_WIDTH / 2
          const centerY = CONTAINER_HEIGHT / 2
          const outerRadius = Math.min(CONTAINER_WIDTH, CONTAINER_HEIGHT) / 2 - 10
          const innerRadius = PIE_OUTER_RADIUS + 5
          
          // Check if bubble violates outer circular boundary
          const distanceFromCenter = Math.sqrt((bubble.position.x - centerX) ** 2 + (bubble.position.y - centerY) ** 2)
          const maxAllowedDistance = outerRadius - radius - 5
          
          if (distanceFromCenter > maxAllowedDistance) {
            // Pull bubble back into bounds
            const scale = maxAllowedDistance / distanceFromCenter
            const correctedX = centerX + (bubble.position.x - centerX) * scale
            const correctedY = centerY + (bubble.position.y - centerY) * scale
            Matter.Body.setPosition(bubble, { x: correctedX, y: correctedY })
            
            // Reduce velocity to prevent immediate boundary violation
            Matter.Body.setVelocity(bubble, { 
              x: bubble.velocity.x * 0.5, 
              y: bubble.velocity.y * 0.5 
            })
          }
          
          // Check if bubble violates inner circular boundary
          const minAllowedDistance = innerRadius + radius + 5
          if (distanceFromCenter < minAllowedDistance) {
            // Push bubble away from center
            const scale = minAllowedDistance / Math.max(distanceFromCenter, 1)
            const correctedX = centerX + (bubble.position.x - centerX) * scale
            const correctedY = centerY + (bubble.position.y - centerY) * scale
            Matter.Body.setPosition(bubble, { x: correctedX, y: correctedY })
            
            // Reduce velocity to prevent immediate boundary violation
            Matter.Body.setVelocity(bubble, { 
              x: bubble.velocity.x * 0.5, 
              y: bubble.velocity.y * 0.5 
            })
          }
          
          // Check if bubble violates sector boundaries
          const bubbleAngle = Math.atan2(bubble.position.y - centerY, bubble.position.x - centerX)
          const normalizedBubbleAngle = ((bubbleAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
          
          // Find which sector this bubble should belong to
          const sectors = calculateSectors()
          let bubbleInCorrectSector = false
          let correctSector = null
          
          for (const sector of sectors) {
            if (sector.tokens.some(token => token.symbol === tokenData.symbol)) {
              correctSector = sector
              const sectorStartAngle = (sector.startAngle * Math.PI) / 180
              const sectorEndAngle = (sector.endAngle * Math.PI) / 180
              const normalizedSectorStart = ((sectorStartAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
              const normalizedSectorEnd = ((sectorEndAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
              
              // Handle angle wrapping around 0/2π
              if (normalizedSectorStart <= normalizedSectorEnd) {
                bubbleInCorrectSector = normalizedBubbleAngle >= normalizedSectorStart && normalizedBubbleAngle <= normalizedSectorEnd
              } else {
                bubbleInCorrectSector = normalizedBubbleAngle >= normalizedSectorStart || normalizedBubbleAngle <= normalizedSectorEnd
              }
              break
            }
          }
          
          // If bubble is in wrong sector, move it to correct sector center
          if (!bubbleInCorrectSector && correctSector) {
            const sectorCenterAngle = (correctSector.startAngle + correctSector.endAngle) / 2 * Math.PI / 180
            const safeDistance = (minAllowedDistance + maxAllowedDistance) / 2
            const correctedX = centerX + safeDistance * Math.cos(sectorCenterAngle)
            const correctedY = centerY + safeDistance * Math.sin(sectorCenterAngle)
            Matter.Body.setPosition(bubble, { x: correctedX, y: correctedY })
            
            // Reduce velocity significantly to prevent sector jumping
            Matter.Body.setVelocity(bubble, { 
              x: bubble.velocity.x * 0.3, 
              y: bubble.velocity.y * 0.3 
            })
          }
        })
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
          bodyId: bubble.id,
          icon: tokenData.icon
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
      <div className="relative mx-auto" style={{ width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT }}>
        {/* Sector dividing lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {sectors.filter(sector => sector.startAngle !== undefined && sector.endAngle !== undefined).map((sector, index) => {
            const centerX = CONTAINER_WIDTH / 2
            const centerY = CONTAINER_HEIGHT / 2
            
            // Helper function to calculate line intersection with circular boundary
            const calculateLineEnd = (angleRad: number) => {
              // Normalize angle to avoid floating point issues
              const normalizedAngle = ((angleRad % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
              const cos = Math.cos(normalizedAngle)
              const sin = Math.sin(normalizedAngle)
              
              // For circular boundary, intersection is at the outer radius
              const circularRadius = Math.min(CONTAINER_WIDTH, CONTAINER_HEIGHT) / 2 - 10
              const endX = centerX + circularRadius * cos
              const endY = centerY + circularRadius * sin
              
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
          
          {/* Outer circular boundary */}
          <circle
            cx={CONTAINER_WIDTH / 2}
            cy={CONTAINER_HEIGHT / 2}
            r={Math.min(CONTAINER_WIDTH, CONTAINER_HEIGHT) / 2 - 10}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2"
            opacity="0.7"
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
          {physicsBubbles.map((bubble) => {
            const hasIcon = bubble.icon && bubble.icon.trim() !== ''
            
            return (
              <div
                key={bubble.id}
                className="absolute rounded-full flex items-center justify-center text-xs font-semibold text-white uppercase cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200"
                style={{
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  left: `${bubble.x}px`,
                  top: `${bubble.y}px`,
                  backgroundColor: hasIcon ? 'transparent' : COLORS[bubble.bucket as keyof typeof COLORS],
                  backgroundImage: hasIcon ? `url(${bubble.icon})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
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
                {/* Show symbol text only if no icon or as overlay for small bubbles */}
                {(!hasIcon || bubble.size <= 25) && (
                  <span 
                    style={{ 
                      textShadow: hasIcon ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none',
                      color: hasIcon ? 'white' : 'white',
                      fontSize: bubble.size > 30 ? '10px' : '8px'
                    }}
                  >
                    {bubble.symbol.substring(0, bubble.size > 30 ? 4 : 3).toUpperCase()}
                  </span>
                )}
              </div>
            )
          })}
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
