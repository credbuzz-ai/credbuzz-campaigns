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

  const chartData = React.useMemo(() => {
    return [
      {
        data: data.map((item) => ({
          x: item.user_info.name,
          y: item.mindshare_percent,
          author_handle: item.author_handle,
          author_buzz: item.author_buzz,
          profile_image_url: item.user_info.profile_image_url,
          followers_count: item.user_info.followers_count,
          followings_count: item.user_info.followings_count,
          smart_followers_count: item.user_info.smart_followers_count,
          engagement_score: item.user_info.engagement_score,
        })),
      },
    ];
  }, [data]);

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
              to: 25,
              color: "#22c55e", // Green-500
              foreColor: "#f8fafc", // Slate-50
              name: "Low Mindshare",
            },
            {
              from: 25,
              to: 50,
              color: "#0ea5e9", // Sky-500
              foreColor: "#f8fafc", // Slate-50
              name: "Medium Mindshare",
            },
            {
              from: 50,
              to: 75,
              color: "#8b5cf6", // Violet-500
              foreColor: "#f8fafc", // Slate-50
              name: "High Mindshare",
            },
            {
              from: 75,
              to: 100,
              color: "#ec4899", // Pink-500
              foreColor: "#f8fafc", // Slate-50
              name: "Very High Mindshare",
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
