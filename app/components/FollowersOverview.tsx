"use client"

import { useState, useEffect, useRef } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, Sector } from "recharts"
import * as d3 from "d3" // Import D3
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

// D3 specific type for nodes
interface D3Node extends d3.SimulationNodeDatum {
  id: string
  follower: Follower
  size: number
  radius: number // Store radius for collision detection
  // Explicitly add x, y, fx, fy as optional for D3 simulation and drag
  x?: number
  y?: number
  fx?: number | null // fx and fy can be null when drag ends
  fy?: number | null
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
    const screenHeight = window.innerHeight
    // Make the circular container much larger and centered - increased by 1.5x
    const size = Math.min(screenWidth * 0.9, screenHeight * 1.05, 1200) // Increased from 0.6, 0.7, 800 to 0.9, 1.05, 1200
    return { 
      width: size, 
      height: size 
    } 
  }
  // Default for SSR - large circular container - increased by 1.5x
  return { width: 900, height: 900 } // Increased from 600x600 to 900x900
}

const CONTAINER_DIMENSIONS = getContainerDimensions()
const CONTAINER_WIDTH = CONTAINER_DIMENSIONS.width
const CONTAINER_HEIGHT = CONTAINER_DIMENSIONS.height

// Utility function to convert hex to RGBA
const hexToRgba = (hex: string, alpha: number = 1): string => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Utility functions
const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

const getBubbleSize = (count: number, maxCount: number, minSize: number = 20, maxSize: number = 150): number => {
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

// Sub-component 1: Followers Bubble Map with D3.js
const FollowersBubbleMap = ({ 
  followers, 
  sortBy, 
  loading,
  selectedTagForFilter
}: { 
  followers: Follower[];
  sortBy: 'followers_count' | 'smart_followers';
  loading: boolean;
  selectedTagForFilter: string | null;
}) => {
  const [hoveredFollower, setHoveredFollower] = useState<Follower | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [containerDimensions, setContainerDimensions] = useState(getContainerDimensions());
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<D3Node, undefined> | null>(null);
  const nodesRef = useRef<D3Node[]>([]); // This will store the D3 nodes data

  useEffect(() => {
    const handleResize = () => {
      const newDimensions = getContainerDimensions();
      setContainerDimensions(newDimensions);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    
    // Constants for the outer border offset
    const OUTER_BORDER_WIDTH = 20; // Width of the outer border
    const OUTER_BORDER_OFFSET = OUTER_BORDER_WIDTH / 2; // Half of 50px translucent border, which is the outermost extent
    const OUTER_SHARP_BORDER_WIDTH = 2; // Width of the outer sharp border
    const OUTER_SHARP_BORDER_OFFSET = OUTER_SHARP_BORDER_WIDTH / 2; // Half of 2px sharp border, which is the outermost extent

    const followersToDisplay = selectedTagForFilter
      ? followers.filter(f => f.tags.includes(selectedTagForFilter.toLowerCase().replace(/ /g, '_')))
      : followers;

    // If loading and there's no specific filter, or if there are no followers to display at all (even without filter)
    // we might want to show a loader or an empty state, which is handled in the return statement.
    // For the D3 logic, if followersToDisplay is empty, we clear the SVG and stop.
    if (followersToDisplay.length === 0) {
      d3.select(svgRef.current).selectAll("*").remove();
      return;
    }

    const { width, height } = containerDimensions;
    const maxCount = Math.max(...followersToDisplay.map(f => sortBy === 'followers_count' ? f.followers_count : f.smart_followers), 0);

    nodesRef.current = followersToDisplay.map((follower): D3Node => {
      const count = sortBy === 'followers_count' ? follower.followers_count : follower.smart_followers;
      const size = getBubbleSize(count, maxCount);
      return {
        id: follower.handle,
        follower: follower,
        size: size,
        radius: size / 2,
        x: width / 2 + (Math.random() - 0.5) * width * 0.3, // Spread initial positions a bit more
        y: height / 2 + (Math.random() - 0.5) * height * 0.3,
      };
    });

    d3.select(svgRef.current).selectAll("*").remove(); // Clear before re-render

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    simulationRef.current = d3.forceSimulation<D3Node>(nodesRef.current)
      .alphaDecay(0.01) // Slow down the cooling rate (default is ~0.0228)
      .alpha(0.7) // Start with a higher alpha
      .force("charge", d3.forceManyBody().strength(15)) 
      .force("collide", d3.forceCollide<D3Node>((d: D3Node) => d.radius + OUTER_BORDER_OFFSET).strength(0.9)) // Reduced padding from +2 to +1
      .force("x", d3.forceX(width / 2).strength(0.01)) 
      .force("y", d3.forceY(height / 2).strength(0.01)) 
      .on("tick", ticked);
    
    simulationRef.current.restart(); // Ensure it starts/restarts effectively

    // RESTORED nodeElements definition and rendering logic
    const nodeElements = svg.selectAll<SVGGElement, D3Node>(".bubble-group")
      .data(nodesRef.current, (d: D3Node) => d.id)
      .join(
        (enter: d3.Selection<d3.EnterElement, D3Node, SVGSVGElement | null, undefined>) => {
          const group = enter.append("g")
            .attr("class", "bubble-group cursor-pointer")
            .style("transform-origin", "center center")
            .on("mouseover", (event: MouseEvent, d: D3Node) => {
              setHoveredFollower(d.follower);
              setTooltipPosition({ x: event.clientX, y: event.clientY });
              d3.select(event.currentTarget as SVGGElement).select("circle").style("filter", "drop-shadow(0 4px 12px rgba(0,0,0,0.3))");
              d3.select(event.currentTarget as SVGGElement).raise();
            })
            .on("mouseout", (event: MouseEvent, d: D3Node) => {
              setHoveredFollower(null);
              d3.select(event.currentTarget as SVGGElement).select("circle").style("filter", "drop-shadow(0 2px 6px rgba(0,0,0,0.1))");
            })
            .on("click", (event: MouseEvent, d: D3Node) => {
              router.push(`/profile/${d.follower.handle}`);
            })
            .call(drag(simulationRef.current!));

          group.append("circle")
            .attr("r", (d: D3Node) => d.radius)
            .attr("fill", "white")
            .style("stroke-width", OUTER_BORDER_WIDTH) // width of the border
            .style("stroke", (d: D3Node) => {
              const primaryTag = d.follower.tags[0] || 'unknown';
              const colorHex = TAG_COLORS[primaryTag as keyof typeof TAG_COLORS] || TAG_COLORS.unknown;
              return hexToRgba(colorHex, 0.5);
            })
            .style("filter", "drop-shadow(0 2px 6px rgba(0,0,0,0.1))");

          group.append("clipPath")
            .attr("id", (d: D3Node) => `clip-${d.id}`)
            .append("circle")
            .attr("r", (d: D3Node) => d.radius);

          group.append("image")
            .attr("xlink:href", (d: D3Node) => d.follower.profile_image_url)
            .attr("clip-path", (d: D3Node) => `url(#clip-${d.id})`)
            .attr("x", (d: D3Node) => -d.radius)
            .attr("y", (d: D3Node) => -d.radius)
            .attr("width", (d: D3Node) => d.size)
            .attr("height", (d: D3Node) => d.size)
            .attr("preserveAspectRatio", "xMidYMid slice")
            .on("error", function(this: SVGImageElement, event: Event, d: D3Node) {
              d3.select(this).remove();
              group.filter((nodeData: D3Node) => nodeData.id === d.id)
                   .append("text")
                   .attr("text-anchor", "middle")
                   .attr("dy", "0.3em")
                   .style("font-size", (dNode: D3Node) => `${Math.max(8, dNode.radius / 3)}px`)
                   .style("font-weight", "bold")
                   .style("fill", "#4A5568")
                   .text((dNode: D3Node) => dNode.follower.profile_name.substring(0, 2).toUpperCase());
            });
          
          // New outer sharp border circle
          group.append("circle")
            .attr("class", "outer-sharp-border")
            .attr("r", (d: D3Node) => d.radius + OUTER_BORDER_OFFSET - OUTER_SHARP_BORDER_OFFSET) // (15px translucent / 2) - (1.5px sharp / 2) = 7.5 - 0.75 = 6.75
            .style("fill", "none")
            .style("stroke-width", OUTER_SHARP_BORDER_OFFSET)
            .style("stroke", (d: D3Node) => {
              const primaryTag = d.follower.tags[0] || 'unknown';
              return TAG_COLORS[primaryTag as keyof typeof TAG_COLORS] || TAG_COLORS.unknown; // Opaque color
            });

          group.append("title")
            .text((d: D3Node) => `${d.follower.profile_name} - ${formatNumber(sortBy === 'followers_count' ? d.follower.followers_count : d.follower.smart_followers)}`);

          return group;
        },
        (update: d3.Selection<SVGGElement, D3Node, SVGSVGElement | null, undefined>) => {
          // Update existing main circle (translucent border)
          update.select<SVGCircleElement>("circle:not(.outer-sharp-border)") // Ensure we don't select the new border circle here
            .transition().duration(300)
            .attr("r", (d: D3Node) => d.radius)
            .style("stroke", (d: D3Node) => {
              const primaryTag = d.follower.tags[0] || 'unknown';
              const colorHex = TAG_COLORS[primaryTag as keyof typeof TAG_COLORS] || TAG_COLORS.unknown;
              return hexToRgba(colorHex, 0.5); 
            });
          
          // Update clipPath
          update.select<SVGClipPathElement>("clipPath").select("circle")
            .transition().duration(300)
            .attr("r", (d: D3Node) => d.radius);

          // Update image
          update.select<SVGImageElement>("image")
            .attr("xlink:href", (d: D3Node) => d.follower.profile_image_url)
            .transition().duration(300)
            .attr("x", (d: D3Node) => -d.radius)
            .attr("y", (d: D3Node) => -d.radius)
            .attr("width", (d: D3Node) => d.size)
            .attr("height", (d: D3Node) => d.size);

          // Update the new outer sharp border circle
          update.select<SVGCircleElement>(".outer-sharp-border")
            .transition().duration(300)
            .attr("r", (d: D3Node) => d.radius + 24.75)
            .style("stroke", (d: D3Node) => {
              const primaryTag = d.follower.tags[0] || 'unknown';
              return TAG_COLORS[primaryTag as keyof typeof TAG_COLORS] || TAG_COLORS.unknown;
            });

          update.select("title")
            .text((d: D3Node) => `${d.follower.profile_name} - ${formatNumber(sortBy === 'followers_count' ? d.follower.followers_count : d.follower.smart_followers)}`);
          return update;
        },
        (exit: d3.Selection<SVGGElement, D3Node, SVGSVGElement | null, undefined>) => exit.remove()
      );
  

    function ticked() {
      nodeElements // This variable is now defined
        .attr("transform", (d: D3Node) => `translate(${d.x},${d.y})`)
        .each((d: D3Node) => {
          if (d.x !== undefined && d.y !== undefined && d.radius !== undefined) {
            // Adjust clamping to account for the full visual extent of the bubble including borders
            const effectiveRadius = d.radius + OUTER_BORDER_OFFSET;
            d.x = Math.max(effectiveRadius, Math.min(width - effectiveRadius, d.x));
            d.y = Math.max(effectiveRadius, Math.min(height - effectiveRadius, d.y));
          }
        });
    }

    function drag(simulation: d3.Simulation<D3Node, undefined>) {
      function dragstarted(event: d3.D3DragEvent<SVGGElement, D3Node, any>, d: D3Node) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, any>, d: D3Node) {
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragended(event: d3.D3DragEvent<SVGGElement, D3Node, any>, d: D3Node) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3.drag<SVGGElement, D3Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [followers, sortBy, loading, containerDimensions, selectedTagForFilter, router]); // Added router to deps for click handler

  const followersToDisplayCount = selectedTagForFilter 
    ? followers.filter(f => f.tags.includes(selectedTagForFilter.toLowerCase().replace(/ /g, '_'))).length 
    : followers.length;

  // Initial loading state for the whole component (before any data or when authorHandle changes)
  if (loading && followers.length === 0 && !selectedTagForFilter) { 
    const loaderHeight = containerDimensions.height > 0 ? containerDimensions.height : CONTAINER_HEIGHT;
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 flex items-center justify-center" style={{ height: loaderHeight }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading followers...</p>
        </div>
      </div>
    );
  }
  
  // State when a filter is active but results in no followers
  if (!loading && selectedTagForFilter && followersToDisplayCount === 0) {
    return (
      <div 
        className="bg-gray-50 rounded-lg border border-gray-200 p-6 flex items-center justify-center"
        style={{ height: containerDimensions.height || CONTAINER_HEIGHT }} 
      >
        <p className="text-gray-500 text-center">
            No followers match the selected tag: "{selectedTagForFilter}".
        </p>
      </div>
    );
  }
  
  // Default: Render the SVG container for D3 to draw in
  return (
    <div className="relative">
      <div 
        className="bg-gray-50 rounded-full border border-gray-200 relative overflow-hidden shadow-lg mx-auto" 
        style={{ 
          width: containerDimensions.width, 
          height: containerDimensions.height,
          padding: '24px'
        }}
      >
        <svg 
          ref={svgRef} 
          className="block rounded-full" 
          style={{ 
            width: containerDimensions.width - 48, 
            height: containerDimensions.height - 48 
          }} 
        />
      </div>
      {hoveredFollower && (
        <div 
          className="fixed z-[1000] pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 15}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translateY(-100%)',
          }}
        >
          <BubbleTooltip follower={hoveredFollower} />
        </div>
      )}
    </div>
  );
}

// Sub-component 2: Tags Distribution Donut Chart
const TagsDistributionChart = ({ 
  followers,
  loading, 
  selectedTagForFilter, 
  setSelectedTagForFilter 
}: { 
  followers: Follower[];
  loading: boolean;
  selectedTagForFilter: string | null;
  setSelectedTagForFilter: (tag: string | null) => void;
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const handlePieClick = (data: any, index: number) => {
    const clickedTagName = data.name; // This is the display name like "Project Member"
    if (selectedTagForFilter === clickedTagName) {
      setSelectedTagForFilter(null); // Toggle off if same tag is clicked
    } else {
      setSelectedTagForFilter(clickedTagName); // Set to the display name
    }
    setActiveIndex(null); // Reset hover effect after click
  };

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

  const tagCounts: { [key: string]: number } = {};
  followers.forEach(follower => {
    follower.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const chartData = Object.entries(tagCounts).map(([tag, count]) => ({
    name: tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Format for display: 'project_member' -> 'Project Member'
    originalTag: tag, // Keep original for potential reverse mapping if needed
    value: count,
    color: TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.unknown
  })).sort((a, b) => b.value - a.value);

  // If no data, show a simple message
  if (chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-xs text-gray-500">No tags</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload // Access payload directly for recharts data
      const currentFollowers = followers // Capture followers in closure for safety in async contexts
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2">
          <p className="font-medium text-xs">{data.name}</p>
          <p className="text-xs text-gray-600">Count: {data.value}</p>
          {currentFollowers && currentFollowers.length > 0 && data.value && ( // Check followers length and data.value
          <p className="text-xs text-gray-600">
              {((data.value / currentFollowers.length) * 100).toFixed(1)}%
          </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <PieChart width={160} height={160}>
        <Pie
          data={chartData}
          cx={80}
          cy={80}
          innerRadius={30}
          outerRadius={65}
          paddingAngle={1}
          dataKey="value"
          nameKey="name"
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
          onClick={handlePieClick} 
          cornerRadius={2}
        >
          {chartData.map((entry, index) => {
            const isGloballySelected = selectedTagForFilter === entry.name;
            const isHoveredCurrently = activeIndex === index;
            
            let cellOpacity = 1;
            let cellStrokeWidth = 1;
            let cellStroke = 'rgba(0,0,0,0.1)';

            if (isGloballySelected) {
              cellOpacity = 1; 
              cellStrokeWidth = 2;
              cellStroke = entry.color;
            } else if (selectedTagForFilter) {
              cellOpacity = 0.3;
            } else if (isHoveredCurrently) {
              cellOpacity = 1;
              cellStrokeWidth = 2;
              cellStroke = entry.color;
            } else if (activeIndex !== null && !isHoveredCurrently) {
              cellOpacity = 0.6;
            }

            return (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                opacity={cellOpacity}
                stroke={cellStroke} 
                strokeWidth={cellStrokeWidth}
                style={{ cursor: 'pointer' }}
              />
            );
          })}
        </Pie>
        <RechartsTooltip content={<CustomTooltip />} />
      </PieChart>
    </div>
  )
}

// Helper function for fetching with retry
async function fetchWithRetry<T>(url: string, options?: RequestInit, attempt = 0, maxRetries = 3, retryDelay = 1000): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch (e) {
        // ignore if can't read body
      }
      // Throw an error to trigger retry logic
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        let responseText = '';
        try {
            responseText = await response.text(); // Attempt to read response text
        } catch(e) {
            // ignore
        }
        throw new Error(`Invalid content type: ${contentType}. Response: ${responseText.substring(0,100)}`);
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
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'followers_count' | 'smart_followers'>('smart_followers');
  const [limit, setLimit] = useState<20 | 50 | 100>(50);
  const [currentAuthorHandle, setCurrentAuthorHandle] = useState<string | null>(null);
  const [selectedTagForFilter, setSelectedTagForFilter] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchFollowersData = async () => {
      if (!authorHandle) {
        setFollowers([]);
        setLoading(false);
        return;
      }
      if (authorHandle !== currentAuthorHandle) {
        setFollowers([]); 
        setCurrentAuthorHandle(authorHandle);
        setSelectedTagForFilter(null); // Clear filter when author changes
      }
      setLoading(true);
      setError(null); 
      try {
        const sortParam = sortBy === 'followers_count' ? 'followers_count_desc' : 'smart_followers_count_desc';
        const data = await fetchWithRetry<ApiResponse>(
          `https://api.cred.buzz/user/author-handle-followers?author_handle=${authorHandle}&sort_by=${sortParam}&limit=${limit}&start=0`
        );
        if (data.result && Array.isArray(data.result.followings)) {
          setFollowers(data.result.followings);
        } else {
          setFollowers([]);
          setError("Failed to parse followers data from API.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching followers.');
        setFollowers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowersData();
  }, [authorHandle, sortBy, limit, currentAuthorHandle]);

  // Loading and error states
  if (error && !loading) { // Show error only if not actively loading new data
    return <div className="p-6 text-center text-red-500">Error: {error}</div>
  }

  return (
    <div className="bg-white min-h-screen relative">
      {/* Header */}
      <div className="p-6 pb-8">
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

      {/* Main Content Area */}
      <div className="relative px-6 pb-6">
        {/* Central Circular Bubble Map */}
        <div className="flex justify-center items-center">
          <div className="text-center relative">
            <h4 className="text-md font-medium text-gray-800 mb-6">
              Top {limit} by {sortBy === 'smart_followers' ? 'Smart Followers' : 'Total Followers'}
              {selectedTagForFilter && <span className="text-sm text-gray-600 ml-2">(filtered by: {selectedTagForFilter})</span>} 
            </h4>
            <FollowersBubbleMap 
              followers={followers}
              sortBy={sortBy}
              loading={loading}
              selectedTagForFilter={selectedTagForFilter}
            />
            
            {/* Bottom Right Tags Distribution Chart - positioned relative to bubble map */}
            <div className="absolute bottom-0 right-0">
              { (loading && followers.length === 0) ? ( 
                 <div className="w-48 h-48 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-500 text-xs">Loading...</p>
                    </div>
                  </div>
              ) : followers.length > 0 ? (
                <div className="w-48 h-48 bg-white rounded-full shadow-lg border border-gray-200 relative flex items-center justify-center">
                  <div className="absolute top-2 left-0 right-0 text-center z-10">
                    <h5 className="text-xs font-medium text-gray-700">Tags</h5>
                  </div>
                  <div className="w-40 h-40 flex items-center justify-center">
                    <TagsDistributionChart 
                      followers={followers}
                      loading={loading && followers.length === 0}
                      selectedTagForFilter={selectedTagForFilter}
                      setSelectedTagForFilter={setSelectedTagForFilter}
                    />
                  </div>
                  {selectedTagForFilter && (
                    <div className="absolute bottom-2 left-0 right-0 text-center z-10">
                      <button 
                        onClick={() => setSelectedTagForFilter(null)}
                        className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              ) : !loading && followers.length === 0 && !error ? ( 
                <div className="w-48 h-48 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center">
                  <p className="text-gray-500 text-xs text-center px-4">No data</p>
                </div>
              ) : null 
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 