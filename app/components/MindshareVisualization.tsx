"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useRef, useEffect, useState } from "react";
// @ts-ignore
import * as d3 from "d3";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-800/50 rounded-lg animate-pulse">
      <div className="h-full w-full grid grid-cols-3 gap-3 p-4">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-700/50 rounded-lg animate-shimmer"
            style={{
              animationDelay: `${i * 100}ms`,
              height: `${Math.max(50, Math.random() * 100)}%`,
            }}
          />
        ))}
      </div>
    </div>
  ),
});

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
    smart_followers_count: number;
    engagement_score: number;
  };
}

interface MindshareVisualizationProps {
  data: MindshareData[];
  selectedTimePeriod?: string;
  onTimePeriodChange?: (period: string) => void;
  loading?: boolean;
}

type ViewType = "treemap" | "voronoi";

export default function MindshareVisualization({ data, selectedTimePeriod, onTimePeriodChange, loading: externalLoading }: MindshareVisualizationProps) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>("treemap");

  // Validate and clean data
  const validData = React.useMemo(() => {
    return data.filter(
      (item) =>
        item &&
        item.user_info &&
        item.user_info.name &&
        typeof item.mindshare_percent === "number" &&
        !isNaN(item.mindshare_percent)
    );
  }, [data]);

  // Use all data for voronoi view
  const voronoiData = React.useMemo(() => {
    return validData
      .sort((a, b) => b.mindshare_percent - a.mindshare_percent);
  }, [validData]);

  // Color scale for voronoi - matching treemap color scheme exactly
  const getColorForMindshare = (mindshare: number) => {
    if (mindshare >= 1.8) return "#dc2626"; // 1.8%+ Mindshare
    if (mindshare >= 1.6) return "#ef4444"; // 1.6-1.8% Mindshare
    if (mindshare >= 1.4) return "#f43f5e"; // 1.4-1.6% Mindshare  
    if (mindshare >= 1.2) return "#ec4899"; // 1.2-1.4% Mindshare
    if (mindshare >= 1.0) return "#d946ef"; // 1.0-1.2% Mindshare
    if (mindshare >= 0.8) return "#a855f7"; // 0.8-1.0% Mindshare
    if (mindshare >= 0.6) return "#8b5cf6"; // 0.6-0.8% Mindshare
    if (mindshare >= 0.4) return "#6366f1"; // 0.4-0.6% Mindshare
    if (mindshare >= 0.2) return "#3b82f6"; // 0.2-0.4% Mindshare
    return "#0ea5e9"; // 0-0.2% Mindshare
  };

  // Treemap data
  const chartData = React.useMemo(() => {
    return [
      {
        data: validData.map((item) => ({
          x: `${item.user_info.name}\n${item.mindshare_percent.toFixed(1)}%`,
          y: Number(item.mindshare_percent.toFixed(4)),
          author_handle: item.author_handle || "",
          twitter_name: item.user_info.name || "",
          author_buzz: item.author_buzz || 0,
          profile_image_url: item.user_info.profile_image_url || null,
          followers_count: item.user_info.followers_count || 0,
          followings_count: item.user_info.followings_count || 0,
          smart_followers_count: item.user_info.smart_followers_count || 0,
          engagement_score: item.user_info.engagement_score || 0,
        })),
      },
    ];
  }, [validData]);

  // Treemap options
  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "treemap",
      background: "transparent",
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
      events: {
        mounted: function () {
          setIsLoading(false);
        },
        click: function (event: any, chartContext: any, config: any) {
          if (config.dataPointIndex >= 0) {
            const dataPoint =
              chartContext.w.config.series[0].data[config.dataPointIndex];
            if (dataPoint?.author_handle) {
              router.push(`/kols/${dataPoint.author_handle}`);
            }
          }
        },
      },
    },
    theme: {
      mode: "dark",
      palette: "palette1",
    },
    title: {
      text: undefined,
    },
    plotOptions: {
      treemap: {
        enableShades: true,
        shadeIntensity: 0.2,
        distributed: true,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 0.2,
              color: "#0ea5e9",
              foreColor: "#f8fafc",
              name: "0-0.2% Mindshare",
            },
            {
              from: 0.2,
              to: 0.4,
              color: "#3b82f6",
              foreColor: "#f8fafc",
              name: "0.2-0.4% Mindshare",
            },
            {
              from: 0.4,
              to: 0.6,
              color: "#6366f1",
              foreColor: "#f8fafc",
              name: "0.4-0.6% Mindshare",
            },
            {
              from: 0.6,
              to: 0.8,
              color: "#8b5cf6",
              foreColor: "#f8fafc",
              name: "0.6-0.8% Mindshare",
            },
            {
              from: 0.8,
              to: 1.0,
              color: "#a855f7",
              foreColor: "#f8fafc",
              name: "0.8-1.0% Mindshare",
            },
            {
              from: 1.0,
              to: 1.2,
              color: "#d946ef",
              foreColor: "#f8fafc",
              name: "1.0-1.2% Mindshare",
            },
            {
              from: 1.2,
              to: 1.4,
              color: "#ec4899",
              foreColor: "#f8fafc",
              name: "1.2-1.4% Mindshare",
            },
            {
              from: 1.4,
              to: 1.6,
              color: "#f43f5e",
              foreColor: "#f8fafc",
              name: "1.4-1.6% Mindshare",
            },
            {
              from: 1.6,
              to: 1.8,
              color: "#ef4444",
              foreColor: "#f8fafc",
              name: "1.6-1.8% Mindshare",
            },
            {
              from: 1.8,
              to: 10,
              color: "#dc2626",
              foreColor: "#f8fafc",
              name: "1.8%+ Mindshare",
            },
          ],
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontWeight: "normal",
      },
      formatter: function (text: string, op: any) {
        const words = text.split(" ");
        let result = "";
        let line = "";
        let lineCount = 0;
        const maxLines = 2;

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " ";
          if (testLine.length > 15 && line.length > 0) {
            result += line.trim() + "\n";
            line = words[i] + " ";
            lineCount++;
            if (lineCount >= maxLines) {
              result = result.trim() + "...";
              break;
            }
          } else {
            line = testLine;
          }
        }
        if (lineCount < maxLines && line.length > 0) {
          result += line.trim();
        }
        return result;
      },
    },
    tooltip: {
      theme: "dark",
      custom: function ({ seriesIndex, dataPointIndex, w }: any) {
        const data = w.config.series[seriesIndex].data[dataPointIndex];
        return `
          <div class="p-4 bg-gray-900/95 border border-[#00D992]/20 rounded-lg shadow-lg backdrop-blur-sm">
            <div class="flex items-center gap-3 mb-3">
              ${
                data.profile_image_url
                  ? `<img src="${data.profile_image_url}" class="w-10 h-10 rounded-full bg-gray-800 object-cover" />`
                  : '<div class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-600">👤</div>'
              }
              <div>
                <div class="font-semibold text-white">${data.twitter_name}</div>
                <div class="text-sm text-gray-400">@${data.author_handle}</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="p-2 bg-gray-800/50 rounded-lg">
                <div class="text-sm text-gray-400">Buzz Score</div>
                <div class="font-medium text-white">${data.author_buzz.toFixed(2)}</div>
              </div>
              <div class="p-2 bg-gray-800/50 rounded-lg">
                <div class="text-sm text-gray-400">Mindshare</div>
                <div class="font-medium text-white">${data.y.toFixed(2)}%</div>
              </div>
              <div class="p-2 bg-gray-800/50 rounded-lg">
                <div class="text-sm text-gray-400">Followers</div>
                <div class="font-medium text-white">${data.followers_count.toLocaleString()}</div>
              </div>
              <div class="p-2 bg-gray-800/50 rounded-lg">
                <div class="text-sm text-gray-400">Following</div>
                <div class="font-medium text-white">${data.followings_count.toLocaleString()}</div>
              </div>
              <div class="p-2 bg-gray-800/50 rounded-lg">
                <div class="text-sm text-gray-400">Smart Followers</div>
                <div class="font-medium text-white">${data.smart_followers_count.toLocaleString()}</div>
              </div>
              <div class="p-2 bg-gray-800/50 rounded-lg">
                <div class="text-sm text-gray-400">Engagement Score</div>
                <div class="font-medium text-white">${data.engagement_score.toFixed(2)}</div>
              </div>
            </div>
            <div class="mt-2 text-xs text-center text-gray-400">Click to view detailed profile</div>
          </div>
        `;
      },
    },
    legend: {
      show: false,
    },
  };

  // Voronoi effect with proportional cell sizes
  useEffect(() => {
    if (currentView !== "voronoi" || !svgRef.current || voronoiData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    const radius = Math.min(width, height) / 2;

    const centerX = width / 2;
    const centerY = height / 2;

    // Create dodecagon path
    const dodecagonPath = (centerX: number, centerY: number, radius: number) => {
      const points = [];
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI / 6) * i;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        points.push([x, y]);
      }
      return "M" + points.join("L") + "Z";
    };

    svg.attr("viewBox", `0 0 ${width} ${height}`)
       .attr("width", "100%")
       .attr("height", "100%");

    // Create dodecagon boundary
    const dodecagon = svg.append("path")
      .attr("d", dodecagonPath(centerX, centerY, radius))
      .attr("fill", "none")
      .attr("stroke", "#00D992")
      .attr("stroke-width", 3)
      .attr("opacity", 0.8);

    // Create dodecagon vertices
    const dodecagonVertices: [number, number][] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI / 6) * i;
      dodecagonVertices.push([
        centerX + radius * 0.95 * Math.cos(angle),
        centerY + radius * 0.95 * Math.sin(angle)
      ]);
    }

    // Strategic positioning for proportional Voronoi cells
    const maxMindshare = Math.max(...voronoiData.map(d => d.mindshare_percent));
    const sites = voronoiData.map((item, i) => {
      const normalizedValue = item.mindshare_percent / maxMindshare;
      
      // Use golden ratio distribution for pleasing visual spacing
      const goldenAngle = (i * 2.618034) + (normalizedValue * Math.PI);
      
      // Higher mindshare = closer to center (creates larger cells naturally)
      const baseRadius = radius * 0.75;
      const distance = baseRadius * (0.2 + (1 - normalizedValue) * 0.6);
      
      return {
        x: centerX + distance * Math.cos(goldenAngle),
        y: centerY + distance * Math.sin(goldenAngle),
        data: item,
        value: item.mindshare_percent
      };
    });

    // Create Voronoi diagram
    const voronoi = d3.Delaunay.from(sites, d => d.x, d => d.y).voronoi([0, 0, width, height]);
    const cellsGroup = svg.append("g").attr("class", "voronoi-cells");

    // Helper function to clip polygon to dodecagon
    function clipPolygonToDodecagon(polygon: number[][], dodecagonVertices: number[][]) {
      let clippedPolygon = [...polygon];
      
      for (let i = 0; i < dodecagonVertices.length; i++) {
        const clipVertex1 = dodecagonVertices[i];
        const clipVertex2 = dodecagonVertices[(i + 1) % dodecagonVertices.length];
        
        if (clippedPolygon.length === 0) break;
        
        const inputList = [...clippedPolygon];
        clippedPolygon = [];
        
        if (inputList.length === 0) continue;
        
        let s = inputList[inputList.length - 1];
        
        for (const e of inputList) {
          if (isInside(e, clipVertex1, clipVertex2)) {
            if (!isInside(s, clipVertex1, clipVertex2)) {
              const intersection = getLineIntersection(s, e, clipVertex1, clipVertex2);
              if (intersection) clippedPolygon.push(intersection);
            }
            clippedPolygon.push(e);
          } else if (isInside(s, clipVertex1, clipVertex2)) {
            const intersection = getLineIntersection(s, e, clipVertex1, clipVertex2);
            if (intersection) clippedPolygon.push(intersection);
          }
          s = e;
        }
      }
      
      return clippedPolygon;
    }
    
    function isInside(point: number[], lineStart: number[], lineEnd: number[]) {
      return ((lineEnd[0] - lineStart[0]) * (point[1] - lineStart[1]) - 
              (lineEnd[1] - lineStart[1]) * (point[0] - lineStart[0])) >= 0;
    }
    
    function getLineIntersection(p1: number[], p2: number[], p3: number[], p4: number[]) {
      const denom = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
      if (Math.abs(denom) < 1e-10) return null;
      
      const t = ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / denom;
      
      return [
        p1[0] + t * (p2[0] - p1[0]),
        p1[1] + t * (p2[1] - p1[1])
      ];
    }

    // Create cells
    sites.forEach((site, i) => {
      const cell = voronoi.cellPolygon(i);
      if (!cell) return;

      const clippedCell = clipPolygonToDodecagon(cell, dodecagonVertices);
      if (clippedCell.length < 3) return;

      const cellGroup = cellsGroup.append("g")
        .attr("class", "cell")
        .style("cursor", "pointer");

      const polygon = cellGroup.append("polygon")
        .attr("points", clippedCell.map(d => d.join(",")).join(" "))
        .attr("fill", getColorForMindshare(site.data.mindshare_percent))
        .attr("stroke", "#1f2937")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.8);

      const centroid = d3.polygonCentroid(clippedCell as [number, number][]);
      const area = Math.abs(d3.polygonArea(clippedCell as [number, number][]));

      if (area > 1000) {
        const text = cellGroup.append("text")
          .attr("x", centroid[0])
          .attr("y", centroid[1])
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#f8fafc")
          .attr("font-size", Math.min(14, Math.sqrt(area) / 8))
          .attr("font-weight", "500")
          .style("pointer-events", "none");

        const name = site.data.user_info.name;
        const mindshareText = `${site.data.mindshare_percent.toFixed(1)}%`;
        
        text.append("tspan")
          .attr("x", centroid[0])
          .attr("dy", "-0.3em")
          .text(name.length > 15 ? name.substring(0, 12) + "..." : name);
        text.append("tspan")
          .attr("x", centroid[0])
          .attr("dy", "1.2em")
          .text(mindshareText);
      }

      cellGroup
        .on("mouseenter", function(event: any) {
          polygon.transition().duration(200)
            .attr("opacity", 1)
            .attr("stroke-width", 2);

          if (tooltipRef.current) {
            const tooltip = d3.select(tooltipRef.current);
            const svgRect = svgRef.current!.getBoundingClientRect();
            const containerRect = svgRef.current!.parentElement!.getBoundingClientRect();
            
            const x = event.clientX - containerRect.left + 15;
            const y = event.clientY - containerRect.top - 10;
            
            tooltip.style("opacity", 1)
              .style("left", x + "px")
              .style("top", y + "px");

            tooltip.select(".tooltip-content").html(`
              <div class="flex items-center gap-3 mb-3">
                ${site.data.user_info.profile_image_url
                  ? `<img src="${site.data.user_info.profile_image_url}" class="w-10 h-10 rounded-full bg-gray-800 object-cover" />`
                  : '<div class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-600">👤</div>'
                }
                <div>
                  <div class="font-semibold text-white">${site.data.user_info.name}</div>
                  <div class="text-sm text-gray-400">@${site.data.author_handle}</div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="p-2 bg-gray-800/50 rounded-lg">
                  <div class="text-sm text-gray-400">Buzz Score</div>
                  <div class="font-medium text-white">${site.data.author_buzz.toFixed(2)}</div>
                </div>
                <div class="p-2 bg-gray-800/50 rounded-lg">
                  <div class="text-sm text-gray-400">Mindshare</div>
                  <div class="font-medium text-white">${site.data.mindshare_percent.toFixed(2)}%</div>
                </div>
                <div class="p-2 bg-gray-800/50 rounded-lg">
                  <div class="text-sm text-gray-400">Followers</div>
                  <div class="font-medium text-white">${site.data.user_info.followers_count.toLocaleString()}</div>
                </div>
                <div class="p-2 bg-gray-800/50 rounded-lg">
                  <div class="text-sm text-gray-400">Following</div>
                  <div class="font-medium text-white">${site.data.user_info.followings_count.toLocaleString()}</div>
                </div>
                <div class="p-2 bg-gray-800/50 rounded-lg">
                  <div class="text-sm text-gray-400">Smart Followers</div>
                  <div class="font-medium text-white">${site.data.user_info.smart_followers_count.toLocaleString()}</div>
                </div>
                <div class="p-2 bg-gray-800/50 rounded-lg">
                  <div class="text-sm text-gray-400">Engagement Score</div>
                  <div class="font-medium text-white">${site.data.user_info.engagement_score.toFixed(2)}</div>
                </div>
              </div>
              <div class="mt-2 text-xs text-center text-gray-400">Click to view detailed profile</div>
            `);
          }
        })
        .on("mouseleave", function() {
          polygon.transition().duration(200)
            .attr("opacity", 0.8)
            .attr("stroke-width", 1.5);

          if (tooltipRef.current) {
            d3.select(tooltipRef.current).style("opacity", 0);
          }
        })
        .on("click", function() {
          router.push(`/kols/${site.data.author_handle}`);
        });
    });

    // Animation
    cellsGroup.selectAll(".cell polygon")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .delay((d: any, i: number) => i * 50)
      .style("opacity", 0.8)
      .on("end", function(d: any, i: number) {
        if (i === sites.length - 1) {
          setIsLoading(false);
        }
      });

    // Add glow effect
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "dodecagon-glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    dodecagon.attr("filter", "url(#dodecagon-glow)");

  }, [currentView, voronoiData, router, getColorForMindshare]);

  // Clear internal loading when external loading finishes
  useEffect(() => {
    if (!externalLoading && isLoading) {
      setIsLoading(false);
    }
  }, [externalLoading, isLoading]);

  // Handle loading states properly
  const hasData = validData.length > 0;
  const isExternalLoading = externalLoading === true;
  // Only show loading overlay if externally loading OR if switching views and data exists
  const showLoadingOverlay = isExternalLoading || (isLoading && hasData && !isExternalLoading);
  const showNoDataMessage = !isExternalLoading && !hasData;

  return (
    <div className="card-trendsage">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-100">
            Community Mindshare
          </h3>
          <p className="text-sm text-gray-400">
            {currentView === "treemap" 
              ? "Distribution of community engagement and influence" 
              : "Community members in dodecagon voronoi representation"}
          </p>
        </div>
        
        {/* View Toggle and Timeline Controls */}
        <div className="flex gap-4">
          {/* Timeline Period Filters */}
          {onTimePeriodChange && selectedTimePeriod && (
            <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
              {["30d", "7d", "1d"].map((period) => (
                <button
                  key={period}
                  onClick={() => onTimePeriodChange(period)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedTimePeriod === period
                      ? "bg-[#00D992] text-gray-900"
                      : "text-gray-300 hover:text-gray-100"
                  }`}
                >
                  {period === "1d" ? "24H" : period.toUpperCase()}
                </button>
              ))}
            </div>
          )}
          
          {/* Map View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setCurrentView("treemap");
                if (hasData) setIsLoading(true);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === "treemap"
                  ? "bg-[#00D992] text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Treemap
            </button>
            <button
              onClick={() => {
                setCurrentView("voronoi");
                if (hasData) setIsLoading(true);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === "voronoi"
                  ? "bg-[#00D992] text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Voronoi
            </button>
          </div>
        </div>
      </div>
      
      <div className="w-full h-[500px] relative">
        {/* Loading Overlay */}
        {showLoadingOverlay && (
          <div className="absolute inset-0 bg-gray-800/50 rounded-lg animate-pulse flex items-center justify-center z-10">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D992]"></div>
              <span className="text-gray-300">Loading visualization...</span>
            </div>
          </div>
        )}
        
        {/* No Data Message */}
        {showNoDataMessage && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center py-8 text-gray-400">
              <div className="text-lg mb-2">No mindshare data available</div>
              <div className="text-sm">
                for {selectedTimePeriod === "1d" ? "24H" : selectedTimePeriod || "this period"}
              </div>
            </div>
          </div>
        )}
        
        {/* Visualizations */}
        {hasData && (
          <>
            {currentView === "treemap" ? (
              <ReactApexChart
                options={chartOptions}
                series={chartData}
                type="treemap"
                height="100%"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg 
                  ref={svgRef} 
                  className="w-full h-full"
                  style={{ maxWidth: "800px", maxHeight: "600px" }}
                />
              </div>
            )}
          </>
        )}
        
        {/* Voronoi Tooltip */}
        {currentView === "voronoi" && hasData && (
          <div
            ref={tooltipRef}
            className="absolute pointer-events-none z-50 p-4 bg-gray-900/95 border border-[#00D992]/20 rounded-lg shadow-lg backdrop-blur-sm opacity-0 transition-opacity duration-200"
            style={{ maxWidth: "320px" }}
          >
            <div className="tooltip-content"></div>
          </div>
        )}
      </div>
    </div>
  );
} 