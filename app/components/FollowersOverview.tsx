"use client"

import { useState, useEffect, useRef } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import Matter from "matter-js"
import { useRouter } from "next/navigation"

// Type definitions
interface Follower {
  handle: string
  profile_name: string
  profile_image_url: string
  tags: string[]
  followers_count: number
  smart_followers: number
  account_created_at: string
}

interface FollowersData {
  followings: Follower[]
  is_more_data: boolean
}

interface ApiResponse {
  result: FollowersData
  message: string
}

interface PhysicsBubble {
  id: string
  follower: Follower
  x: number
  y: number
  size: number
  bodyId: number
}

// Color scheme for tags
const TAG_COLORS = {
  influencer: "#8884d8",
  project: "#82ca9d", 
  project_member: "#ffc658",
  project_coin: "#ff7300",
  project_main: "#0088fe",
  venture_capital: "#ff69b4",
  unknown: "#808080"
}

// Constants for physics container - make it responsive and larger
const getContainerDimensions = () => {
  if (typeof window !== 'undefined') {
    const screenWidth = window.innerWidth
    if (screenWidth >= 1536) { // 2xl breakpoint
      return { width: 1000, height: 500 }
    } else if (screenWidth >= 1280) { // xl breakpoint
      return { width: 800, height: 450 }
    } else if (screenWidth >= 1024) { // lg breakpoint
      return { width: 700, height: 400 }
    } else {
      return { width: 600, height: 350 }
    }
  }
  return { width: 800, height: 450 } // default for SSR
}

const CONTAINER_DIMENSIONS = getContainerDimensions()
const CONTAINER_WIDTH = CONTAINER_DIMENSIONS.width
const CONTAINER_HEIGHT = CONTAINER_DIMENSIONS.height

// Utility functions
const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

const getBubbleSize = (count: number, maxCount: number, minSize: number = 40, maxSize: number = 150): number => {
  if (maxCount === 0) return minSize
  // Use linear scale for more drastic size difference
  const normalized = count / maxCount
  // Adjust the interpolation to bias towards slightly larger minimum sizes if needed, or keep linear
  // Keeping linear for now as requested for 'more drastic', but increasing max.
  return minSize + (maxSize - minSize) * normalized
}

// Tooltip component for bubble hover
const BubbleTooltip = ({ follower }: { follower: Follower }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <img 
          src={follower.profile_image_url} 
          alt={follower.profile_name}
          className="w-8 h-8 rounded-full"
        />
        <div>
          <p className="font-medium text-gray-900 text-sm">{follower.profile_name}</p>
          <p className="text-xs text-gray-500">@{follower.handle}</p>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <p><span className="font-medium">Followers:</span> {formatNumber(follower.followers_count)}</p>
        <p><span className="font-medium">Smart Followers:</span> {formatNumber(follower.smart_followers)}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {follower.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.unknown }}
            >
              {tag.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Sub-component 1: Followers Bubble Map with Physics
const FollowersBubbleMap = ({ 
  followers, 
  sortBy, 
  loading 
}: { 
  followers: Follower[]
  sortBy: 'followers_count' | 'smart_followers'
  loading: boolean
}) => {
  const [hoveredFollower, setHoveredFollower] = useState<Follower | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [physicsBubbles, setPhysicsBubbles] = useState<PhysicsBubble[]>([])
  const [containerDimensions, setContainerDimensions] = useState({ 
    width: CONTAINER_WIDTH, 
    height: CONTAINER_HEIGHT 
  })
  
  // Get Next.js router
  const router = useRouter()

  // Refs for Matter.js
  const engineRef = useRef<Matter.Engine | null>(null)
  const wallBodiesRef = useRef<Matter.Body[]>([])
  const bubbleBodiesRef = useRef<Matter.Body[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newDimensions = getContainerDimensions()
      setContainerDimensions(newDimensions)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Create physics walls
  const createWalls = (): Matter.Body[] => {
    const wallThickness = 20
    const walls: Matter.Body[] = []

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

    return walls
  }

  // Create bubble bodies
  const createBubbleBodies = (followers: Follower[], sortBy: 'followers_count' | 'smart_followers'): Matter.Body[] => {
    const bubbles: Matter.Body[] = []
    const maxCount = Math.max(...followers.map(f => sortBy === 'followers_count' ? f.followers_count : f.smart_followers))

    followers.forEach((follower, index) => {
      const count = sortBy === 'followers_count' ? follower.followers_count : follower.smart_followers
      const size = getBubbleSize(count, maxCount)
      const radius = size / 2

      // Set initial position to the center of the container
      const x = CONTAINER_WIDTH / 2
      const y = CONTAINER_HEIGHT / 2

      const bubble = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.9, // Increased restitution for more bounce
        frictionAir: 0.02,
        friction: 0.2, // Decreased friction
        density: 0.001,
        render: { visible: false }
      })

      // Add custom data
      ;(bubble as any).followerData = {
        follower,
        size
      }

      // Apply random initial force for movement
      const forceMultiplier = 2 // Increased force multiplier by user
      const forceX = (Math.random() - 0.5) * forceMultiplier
      const forceY = (Math.random() - 0.5) * forceMultiplier
      Matter.Body.applyForce(bubble, bubble.position, { x: forceX, y: forceY })

      bubbles.push(bubble)
    })

    return bubbles
  }

  // Physics engine setup and cleanup
  useEffect(() => {
    if (loading || followers.length === 0) return

    // Create engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0 }, // Set gravity to zero for floating effect
      positionIterations: 10, // Increased iterations for more accurate collision resolution
      velocityIterations: 8 // Increased iterations for more accurate collision resolution
    })
    engineRef.current = engine

    // Create a renderer (optional, but helpful for debugging)
    // const render = Matter.Render.create({
    //   element: containerRef.current!,
    //   engine: engine,
    //   options: {
    //     width: CONTAINER_WIDTH,
    //     height: CONTAINER_HEIGHT,
    //     wireframes: false
    //   }
    // });
    // Matter.Render.run(render);

    // Create walls
    const walls = createWalls()
    wallBodiesRef.current = walls
    Matter.World.add(engine.world, walls)

    // Create bubbles
    const bubbles = createBubbleBodies(followers, sortBy)
    bubbleBodiesRef.current = bubbles
    Matter.World.add(engine.world, bubbles)

    // Add mouse control
    const mouse = Matter.Mouse.create(containerRef.current!)
    mouse.element.style.zIndex = '100' // Ensure mouse capture area is above other elements
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.02, // Lower stiffness for smoother following
        render: { visible: false }
      }
    })

    Matter.World.add(engine.world, mouseConstraint)

    // Add click event listener to the mouse constraint
    Matter.Events.on(mouseConstraint, 'mouseup', function(event: any) {
      const mouse = event.mouse;
      const body = event.source.body;

      // Check if a body was released and it's one of our bubbles
      // Also check if the mouse didn't move much, to distinguish click from drag
      const clickThreshold = 5; // Pixels moved to consider it a drag
      const mouseMoved = Math.abs(mouse.mouseupPosition.x - mouse.mousedownPosition.x) > clickThreshold ||
                         Math.abs(mouse.mouseupPosition.y - mouse.mousedownPosition.y) > clickThreshold;

      if (body && !mouseMoved && (body as any).followerData) {
        // It's a click on a bubble
        const followerHandle = (body as any).followerData.follower.handle;
        router.push(`/profile/${followerHandle}`);
      }
    });

    // Keep the mouse in sync with the canvas
    // mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    // mouse.element.removeEventListener("DOMMouseScroll", mouse.DOMMouseScroll);

    // Animation loop
    let frameCount = 0
    const updatePhysics = () => {
      if (engineRef.current) {
        Matter.Engine.update(engineRef.current, 16.666) // ~60fps
        
        // Boundary enforcement
        bubbles.forEach((bubble) => {
          const followerData = (bubble as any).followerData
          const radius = followerData.size / 2
          
          // Check boundaries and correct position if needed
          let correctedX = bubble.position.x
          let correctedY = bubble.position.y
          let needsCorrection = false

          if (bubble.position.x - radius < 0) {
            correctedX = radius
            needsCorrection = true
          } else if (bubble.position.x + radius > CONTAINER_WIDTH) {
            correctedX = CONTAINER_WIDTH - radius
            needsCorrection = true
          }

          if (bubble.position.y - radius < 0) {
            correctedY = radius
            needsCorrection = true
          } else if (bubble.position.y + radius > CONTAINER_HEIGHT) {
            correctedY = CONTAINER_HEIGHT - radius
            needsCorrection = true
          }

          if (needsCorrection) {
            Matter.Body.setPosition(bubble, { x: correctedX, y: correctedY })
            // Reduce velocity to prevent immediate boundary violation
            Matter.Body.setVelocity(bubble, { 
              x: bubble.velocity.x * 0.5, 
              y: bubble.velocity.y * 0.5 
            })
          }
        })
      }
      
      // Update React state with current positions
      const updatedBubbles: PhysicsBubble[] = bubbles.map((bubble) => {
        const followerData = (bubble as any).followerData
        return {
          id: followerData.follower.handle,
          follower: followerData.follower,
          x: bubble.position.x,
          y: bubble.position.y,
          size: followerData.size,
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
  }, [followers, sortBy, loading])

  const handleBubbleHover = (e: React.MouseEvent, follower: Follower) => {
    setHoveredFollower(follower)
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }

  const handleBubbleLeave = () => {
    setHoveredFollower(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-lg" style={{ height: CONTAINER_HEIGHT }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading followers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className="bg-gray-50 rounded-lg border border-gray-200 relative overflow-hidden"
        style={{ width: containerDimensions.width, height: containerDimensions.height }}
      >
        {/* Physics bubbles */}
        <div className="absolute inset-0">
          {physicsBubbles.map((bubble) => {
            const primaryTag = bubble.follower.tags[0] || 'unknown'
            const count = sortBy === 'followers_count' ? bubble.follower.followers_count : bubble.follower.smart_followers
            
            return (
              <div
                key={bubble.id}
                className="absolute rounded-full cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10"
                style={{
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  left: `${bubble.x}px`,
                  top: `${bubble.y}px`,
                  transform: 'translate(-50%, -50%)',
                  border: `3px solid ${TAG_COLORS[primaryTag as keyof typeof TAG_COLORS] || TAG_COLORS.unknown}`,
                  backgroundColor: 'white',
                  boxShadow: hoveredFollower?.handle === bubble.follower.handle ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.1)',
                  zIndex: hoveredFollower?.handle === bubble.follower.handle ? 10 : 5,
                }}
                onMouseEnter={(e) => handleBubbleHover(e, bubble.follower)}
                onMouseLeave={handleBubbleLeave}
                onClick={() => router.push(`/profile/${bubble.follower.handle}`)}
                title={`${bubble.follower.profile_name} - ${formatNumber(count)}`}
              >
                <img 
                  src={bubble.follower.profile_image_url} 
                  alt={bubble.follower.profile_name}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">${bubble.follower.profile_name.substring(0, 2)}</div>`
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredFollower && (
        <div 
          className="fixed z-[1000] pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 15}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translateY(-100%)'
          }}
        >
          <BubbleTooltip follower={hoveredFollower} />
        </div>
      )}
    </div>
  )
}

// Sub-component 2: Tags Distribution Donut Chart
const TagsDistributionChart = ({ 
  followers,
  loading 
}: { 
  followers: Follower[]
  loading: boolean
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading chart...</p>
        </div>
      </div>
    )
  }

  // Count tag occurrences
  const tagCounts: { [key: string]: number } = {}
  followers.forEach(follower => {
    follower.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  // Convert to chart data
  const chartData = Object.entries(tagCounts).map(([tag, count]) => ({
    name: tag.replace('_', ' '),
    value: count,
    color: TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.unknown
  })).sort((a, b) => b.value - a.value)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">Count: {data.value}</p>
          <p className="text-sm text-gray-600">
            {((data.value / followers.length) * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {value} ({entry.payload?.value || 0})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Helper function for fetching with retry
async function fetchWithRetry<T>(url: string, options?: RequestInit, attempt = 0, maxRetries = 3, retryDelay = 1000): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      // Throw an error to trigger retry logic
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

// Main component
export default function FollowersOverview({ authorHandle }: { authorHandle: string }) {
  const [followers, setFollowers] = useState<Follower[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'followers_count' | 'smart_followers'>('smart_followers')
  const [limit, setLimit] = useState<20 | 50 | 100>(50)

  // Fetch data
  useEffect(() => {
    const fetchFollowersData = async () => {
      try {
        setLoading(true)
        const sortParam = sortBy === 'followers_count' ? 'followers_count_desc' : 'smart_followers_count_desc'
        
        // Use fetchWithRetry
        const data = await fetchWithRetry<ApiResponse>(
          `https://api.cred.buzz/user/author-handle-followers?author_handle=${authorHandle}&sort_by=${sortParam}&limit=${limit}&start=0`
        )
        
        setFollowers(data.result.followings)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (authorHandle) {
      fetchFollowersData()
    }
  }, [authorHandle, sortBy, limit])

  // Loading and error states
  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Followers Overview</h3>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Sort By Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSortBy('smart_followers')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'smart_followers' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Smart Followers
              </button>
              <button
                onClick={() => setSortBy('followers_count')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sortBy === 'followers_count' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Total Followers
              </button>
            </div>
          </div>

          {/* Limit Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Show:</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {([20, 50, 100] as const).map((num) => (
                <button
                  key={num}
                  onClick={() => setLimit(num)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    limit === num 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Top {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sub-component 1: Followers Bubble Map */}
        <div className="min-w-0 lg:col-span-2">
          <h4 className="text-md font-medium text-gray-800 mb-3">
            Top {limit} by {sortBy === 'smart_followers' ? 'Smart Followers' : 'Total Followers'}
          </h4>
          <div className="w-full overflow-x-auto">
            <FollowersBubbleMap 
              followers={followers}
              sortBy={sortBy}
              loading={loading}
            />
          </div>
        </div>

        {/* Sub-component 2: Tags Distribution Chart */}
        <div className="min-w-0">
          <h4 className="text-md font-medium text-gray-800 mb-3">
            Tags Distribution
          </h4>
          <TagsDistributionChart 
            followers={followers}
            loading={loading}
          />
        </div>
      </div>

      {/* Summary Stats */}
      {!loading && followers.length > 0 && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(followers.reduce((sum, f) => sum + f.followers_count, 0))}
              </p>
              <p className="text-sm text-gray-600">Total Followers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(followers.reduce((sum, f) => sum + f.smart_followers, 0))}
              </p>
              <p className="text-sm text-gray-600">Smart Followers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {followers.length}
              </p>
              <p className="text-sm text-gray-600">Profiles</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {new Set(followers.flatMap(f => f.tags)).size}
              </p>
              <p className="text-sm text-gray-600">Unique Tags</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 