import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import React from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export interface MindshareHistoryData {
  created_at: string;
  mindshare_percent: number;
  tweet_count: number;
  author_buzz: number;
  project_buzz: number;
}

interface MindshareHistoryChartProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    "1d": MindshareHistoryData[];
  };
  projectName: string;
  authorHandle: string;
}

export default function MindshareHistoryChart({
  isOpen,
  onClose,
  data,
  projectName,
  authorHandle,
}: MindshareHistoryChartProps) {
  // Add debug logging
  React.useEffect(() => {
    console.log("MindshareHistoryChart props:", {
      isOpen,
      data,
      projectName,
      authorHandle,
    });
  }, [isOpen, data, projectName, authorHandle]);

  const chartData = React.useMemo(() => {
    console.log("Processing chart data:", data);
    if (!data) {
      console.log("No data available");
      return [];
    }

    const periodData = data["1d"] || [];
    const sortedData = [...periodData].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return [
      {
        name: "Last 24 Hours",
        data: sortedData.map((item) => ({
          x: new Date(item.created_at).getTime(),
          y: parseFloat(item.mindshare_percent.toFixed(2)),
          tweet_count: item.tweet_count,
          author_buzz: item.author_buzz,
          project_buzz: item.project_buzz,
        })),
      },
    ];
  }, [data]);

  const hasData = data["1d"]?.length > 0;

  if (!hasData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-800 text-gray-100 border-gray-700">
          <DialogHeader>
            <DialogTitle>No Mindshare History</DialogTitle>
            <DialogDescription className="text-gray-400">
              No mindshare history data available for @{authorHandle}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      background: "transparent",
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        dynamicAnimation: {
          speed: 350,
        },
      },
      stacked: false,
      fontFamily: "Inter, sans-serif",
      height: "100%",
      parentHeightOffset: 0,
    },
    theme: {
      mode: "dark",
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: 15,
        distributed: false,
        rangeBarOverlap: true,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#00D992"],
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        },
        format: "MMM dd HH:mm",
        rotateAlways: false,
        hideOverlappingLabels: true,
        offsetY: 10,
        trim: false,
        minHeight: 40,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      crosshairs: {
        show: true,
        position: "back",
        stroke: {
          color: "#374151",
          width: 1,
          dashArray: 3,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    yaxis: {
      title: {
        text: "Mindshare %",
        style: {
          color: "#9CA3AF",
          fontSize: "13px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
        },
      },
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        },
        formatter: (value) => value.toFixed(1) + "%",
      },
      min: 0,
      max: (maxValue) =>
        Math.min(
          Math.ceil(maxValue + maxValue * 0.1),
          Math.max(4, maxValue * 1.2)
        ),
      tickAmount: 4,
      forceNiceScale: true,
      floating: false,
    },
    grid: {
      show: true,
      borderColor: "#1f2937",
      strokeDashArray: 3,
      position: "back",
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 20,
        right: 15,
        bottom: 20,
        left: 10,
      },
    },
    tooltip: {
      enabled: true,
      shared: false,
      intersect: true,
      custom: function ({ series, seriesIndex, dataPointIndex }: any) {
        const point = chartData[seriesIndex].data[dataPointIndex];
        return `
          <div class="p-4 bg-[#111827] border border-gray-800 rounded-lg shadow-xl" style="backdrop-filter: blur(8px);">
            <div class="mb-3">
              <div class="flex items-baseline gap-1.5">
                <span class="font-semibold text-[#10B981] text-xl">${series[
                  seriesIndex
                ][dataPointIndex].toFixed(2)}%</span>
                <span class="text-xs text-gray-400 font-medium">mindshare</span>
              </div>
              <div class="text-xs text-gray-500 mt-1">${new Date(
                point.x
              ).toLocaleString()}</div>
            </div>
            <div class="space-y-2.5">
              <div class="flex justify-between items-center">
                <div class="text-gray-400 text-xs font-medium">Tweets</div>
                <div class="font-semibold text-white text-sm">${
                  point.tweet_count
                }</div>
              </div>
              <div class="flex justify-between items-center">
                <div class="text-gray-400 text-xs font-medium">Author Buzz</div>
                <div class="font-semibold text-white text-sm">${point.author_buzz.toFixed(
                  2
                )}</div>
              </div>
              <div class="flex justify-between items-center">
                <div class="text-gray-400 text-xs font-medium">Project Buzz</div>
                <div class="font-semibold text-white text-sm">${point.project_buzz.toFixed(
                  2
                )}</div>
              </div>
            </div>
          </div>
        `;
      },
    },
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "right",
      offsetY: 0,
      height: 40,
      labels: {
        colors: "#9CA3AF",
        useSeriesColors: true,
      },
      markers: {
        size: 8,
        strokeWidth: 0,
        fillColors: ["#10B981"],
        shape: "circle",
        offsetX: 0,
        offsetY: 0,
      },
      itemMargin: {
        horizontal: 16,
      },
    },
    states: {
      hover: {
        filter: {
          type: "lighten",
        },
      },
      active: {
        filter: {
          type: "darken",
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetY: 0,
          },
        },
      },
    ],
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111827] text-gray-100 border-gray-800/50 max-w-3xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-semibold">
            Mindshare History
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Historical mindshare data for @{authorHandle}
          </DialogDescription>
        </DialogHeader>
        <div className="h-[450px] pb-10">
          <ReactApexChart
            options={chartOptions}
            series={chartData}
            type="bar"
            height="100%"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
