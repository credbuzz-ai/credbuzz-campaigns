"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

interface MindshareData {
  author_handle: string;
  author_buzz: number;
  mindshare_percent: number;
  user_info: {
    name: string;
    handle: string;
    profile_image_url: string | null;
    followers_count: number;
    followings_count: number;
  };
}

interface MindshareTreemapProps {
  data: MindshareData[];
}

type HierarchyDatum = { children: MindshareData[] } | MindshareData;

const getTooltipPosition = (event: MouseEvent, tooltipElement: HTMLElement) => {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const tooltipDimensions = tooltipElement.getBoundingClientRect();
  const padding = 10; // Space between cursor and tooltip

  // Default position (to the right of cursor)
  let left = event.pageX + padding;
  let top = event.pageY - padding;

  // Check if tooltip would extend beyond right edge
  if (event.clientX + padding + tooltipDimensions.width > viewport.width) {
    // Position tooltip to the left of cursor instead
    left = event.pageX - tooltipDimensions.width - padding;
  }

  // Check if tooltip would extend beyond bottom edge
  if (event.clientY + tooltipDimensions.height > viewport.height) {
    // Position tooltip above cursor
    top = event.pageY - tooltipDimensions.height - padding;
  }

  return { left, top };
};

export default function MindshareTreemap({ data }: MindshareTreemapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    function handleResize() {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        if (container) {
          setDimensions({
            width: container.clientWidth,
            height: Math.max(400, container.clientWidth * 0.6),
          });
        }
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Create color scale with a more vibrant palette
    const colorScale = d3
      .scaleSequential()
      .domain([0, d3.max(data, (d) => d.mindshare_percent) || 1])
      .interpolator(d3.interpolateViridis); // Using viridis for better color distinction

    // Create tooltip with improved styling
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "mindshare-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(17, 24, 39, 0.95)")
      .style("border", "1px solid #00D992")
      .style("color", "#f3f4f6")
      .style("padding", "16px")
      .style("border-radius", "12px")
      .style("font-size", "14px")
      .style("pointer-events", "none")
      .style("z-index", "9999")
      .style("box-shadow", "0 20px 25px -5px rgba(0, 0, 0, 0.2)")
      .style("backdrop-filter", "blur(8px)")
      .style("max-width", "300px"); // Add max-width to control tooltip size

    // Prepare hierarchical data
    const hierarchyData = { children: data };
    const root = d3
      .hierarchy<HierarchyDatum>(hierarchyData)
      .sum((d) => ("author_buzz" in d ? d.author_buzz : 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create treemap layout with rounded corners
    const treemap = d3
      .treemap<HierarchyDatum>()
      .size([width, height])
      .padding(4)
      .round(true);

    treemap(root);

    // Create main group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create cells with improved styling and animations
    const cell = g
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    // Add rectangles with animations and hover effects
    cell
      .append("rect")
      .attr("width", (d) => d.x1! - d.x0!)
      .attr("height", (d) => d.y1! - d.y0!)
      .attr("fill", (d) => {
        const nodeData = d.data as MindshareData;
        return colorScale(nodeData.mindshare_percent);
      })
      .attr("stroke", "#1f2937")
      .attr("stroke-width", 2)
      .attr("rx", 4) // Rounded corners
      .style("cursor", "pointer")
      .style("transition", "all 0.2s ease")
      .style("opacity", 0) // Start with opacity 0 for fade-in animation
      .transition()
      .duration(500)
      .delay((_, i) => i * 50) // Stagger the animations
      .style("opacity", 1) // Fade in
      .on("end", function () {
        // Add hover effects after animation
        d3.select(this)
          .on("mouseover", function (event, d) {
            const nodeData = d.data as MindshareData;
            d3.select(this)
              .transition()
              .duration(200)
              .attr("stroke", "#00D992")
              .attr("stroke-width", 3)
              .style("filter", "drop-shadow(0 4px 12px rgba(0,217,146,0.2))");

            tooltip.style("visibility", "visible").html(`
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <img 
                      src="${nodeData.user_info.profile_image_url || ""}" 
                      class="w-8 h-8 rounded-full bg-gray-700"
                      onerror="this.style.display='none'"
                    />
                    <div>
                      <div class="font-semibold">${
                        nodeData.user_info.name
                      }</div>
                      <div class="text-gray-400 text-sm">@${
                        nodeData.user_info.handle
                      }</div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div class="text-gray-400">Buzz Score</div>
                      <div class="font-medium">${nodeData.author_buzz.toFixed(
                        2
                      )}</div>
                    </div>
                    <div>
                      <div class="text-gray-400">Mindshare</div>
                      <div class="font-medium">${nodeData.mindshare_percent.toFixed(
                        2
                      )}%</div>
                    </div>
                    <div>
                      <div class="text-gray-400">Followers</div>
                      <div class="font-medium">${nodeData.user_info.followers_count.toLocaleString()}</div>
                    </div>
                    <div>
                      <div class="text-gray-400">Tweets</div>
                      <div class="font-medium">${nodeData.tweet_count.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              `);

            // Calculate and set the tooltip position after content is set
            const tooltipNode = tooltip.node();
            if (tooltipNode) {
              const position = getTooltipPosition(event, tooltipNode);
              tooltip
                .style("left", `${position.left}px`)
                .style("top", `${position.top}px`);
            }
          })
          .on("mousemove", function (event) {
            // Update position on mousemove
            const tooltipNode = tooltip.node();
            if (tooltipNode) {
              const position = getTooltipPosition(event, tooltipNode);
              tooltip
                .style("left", `${position.left}px`)
                .style("top", `${position.top}px`);
            }
          })
          .on("mouseout", function () {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("stroke", "#1f2937")
              .attr("stroke-width", 2)
              .style("filter", "none");
            tooltip.style("visibility", "hidden");
          });
      });

    // Add text labels with better visibility
    cell
      .append("text")
      .attr("x", 4)
      .attr("y", 14)
      .style("font-size", "10px")
      .style("fill", "white")
      .style("font-weight", "500")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
      .style("opacity", 0)
      .text((d) => {
        const width = d.x1! - d.x0!;
        const height = d.y1! - d.y0!;
        if (width < 60 || height < 30) return "";
        const nodeData = d.data as MindshareData;
        return nodeData.user_info.name;
      })
      .transition()
      .duration(500)
      .delay((_, i) => i * 50 + 250) // Slightly delayed after rectangles
      .style("opacity", 1);

    // Add percentage labels
    cell
      .append("text")
      .attr("x", 4)
      .attr("y", 26)
      .style("font-size", "9px")
      .style("fill", "rgba(255,255,255,0.9)")
      .style("font-weight", "500")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
      .style("opacity", 0)
      .text((d) => {
        const width = d.x1! - d.x0!;
        const height = d.y1! - d.y0!;
        if (width < 60 || height < 30) return "";
        const nodeData = d.data as MindshareData;
        return `${nodeData.mindshare_percent.toFixed(1)}%`;
      })
      .transition()
      .duration(500)
      .delay((_, i) => i * 50 + 500) // Further delayed after names
      .style("opacity", 1);

    // Cleanup
    return () => {
      tooltip.remove();
    };
  }, [data, dimensions]);

  return (
    <div className="w-full h-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-[#00D992]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#00D992]/10">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-100">
            Community Mindshare
          </h3>
          <p className="text-sm text-gray-400">
            Distribution of community engagement and influence
          </p>
        </div>
      </div>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
    </div>
  );
}
