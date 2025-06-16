"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React from "react";

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

interface MindshareTreemapProps {
  data: MindshareData[];
}

export default function MindshareTreemap({ data }: MindshareTreemapProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  // Validate and clean data to prevent null values
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

  const chartData = React.useMemo(() => {
    return [
      {
        data: validData.map((item) => ({
          x: item.user_info.name || "Unknown",
          y: Number(item.mindshare_percent.toFixed(4)), // Ensure number and limit decimal places
          author_handle: item.author_handle || "",
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

  // If no valid data, show a message
  if (validData.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-400">
        No valid mindshare data available
      </div>
    );
  }

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
        click: function (event, chartContext, config) {
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
              color: "#0ea5e9", // Sky-500 (Lightest blue)
              foreColor: "#f8fafc", // Slate-50
              name: "0-0.2% Mindshare",
            },
            {
              from: 0.2,
              to: 0.4,
              color: "#3b82f6", // Blue-500
              foreColor: "#f8fafc", // Slate-50
              name: "0.2-0.4% Mindshare",
            },
            {
              from: 0.4,
              to: 0.6,
              color: "#6366f1", // Indigo-500
              foreColor: "#f8fafc", // Slate-50
              name: "0.4-0.6% Mindshare",
            },
            {
              from: 0.6,
              to: 0.8,
              color: "#8b5cf6", // Violet-500
              foreColor: "#f8fafc", // Slate-50
              name: "0.6-0.8% Mindshare",
            },
            {
              from: 0.8,
              to: 1.0,
              color: "#a855f7", // Purple-500
              foreColor: "#f8fafc", // Slate-50
              name: "0.8-1.0% Mindshare",
            },
            {
              from: 1.0,
              to: 1.2,
              color: "#d946ef", // Fuchsia-500
              foreColor: "#f8fafc", // Slate-50
              name: "1.0-1.2% Mindshare",
            },
            {
              from: 1.2,
              to: 1.4,
              color: "#ec4899", // Pink-500
              foreColor: "#f8fafc", // Slate-50
              name: "1.2-1.4% Mindshare",
            },
            {
              from: 1.4,
              to: 1.6,
              color: "#f43f5e", // Rose-500
              foreColor: "#f8fafc", // Slate-50
              name: "1.4-1.6% Mindshare",
            },
            {
              from: 1.6,
              to: 1.8,
              color: "#ef4444", // Red-500
              foreColor: "#f8fafc", // Slate-50
              name: "1.6-1.8% Mindshare",
            },
            {
              from: 1.8,
              to: 10,
              color: "#dc2626", // Red-600 (Darkest red)
              foreColor: "#f8fafc", // Slate-50
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
        // Limit text to 2 lines with ellipsis
        const words = text.split(" ");
        let result = "";
        let line = "";
        let lineCount = 0;
        const maxLines = 2;

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " ";
          if (testLine.length > 15 && line.length > 0) {
            // Max 15 chars per line
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
      custom: function ({ seriesIndex, dataPointIndex, w }) {
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
                <div class="font-semibold text-white">${data.x}</div>
                <div class="text-sm text-gray-400">@${data.author_handle}</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="p-2 bg-gray-800/50 rounded-lg">
                <div class="text-sm text-gray-400">Buzz Score</div>
                <div class="font-medium text-white">${data.author_buzz.toFixed(
                  2
                )}</div>
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
                <div class="font-medium text-white">${data.engagement_score.toFixed(
                  2
                )}</div>
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

  return (
    <div className="card-trendsage">
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
      <div className="w-full h-[500px] hover:scale-[1.01] transition-transform duration-300 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-800/50 rounded-lg animate-pulse">
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
        )}
        <ReactApexChart
          options={chartOptions}
          series={chartData}
          type="treemap"
          height="100%"
        />
      </div>
    </div>
  );
}
