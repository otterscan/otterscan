import { ChartData, ChartOptions } from "chart.js";
import { ExtendedBlock } from "../../useErigonHooks";
import { commify } from "../../utils/utils";

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${((red << 16) + (green << 8) + blue).toString(16).padStart(6, "0")}`;
}

function interpolateColor(gasUsed: number, gasLimit: number): string {
  const red = Math.floor(255 + (gasUsed / gasLimit) * (0 - 255));
  const green = Math.floor(255 + (gasUsed / gasLimit) * (0 - 255));
  const blue = 255;
  return rgbToHex(red, green, blue);
}

export const burntFeesChartOptions: ChartOptions<"line"> = {
  animation: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: {
        callback: function (v) {
          // @ts-ignore
          return commify(this.getLabelForValue(v));
        },
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Burnt fees",
      },
      ticks: {
        callback: (v) => `${(v as number) / 1e9} ETH`,
      },
    },
    yBaseFee: {
      position: "right",
      beginAtZero: true,
      title: {
        display: true,
        text: "Base fee",
      },
      ticks: {
        callback: (v) => `${(v as number) / 1e9} Gwei`,
      },
      grid: {
        drawOnChartArea: false,
      },
    },
  },
};

export const burntFeesChartData = (
  blocks: ExtendedBlock[],
): ChartData<"line"> => ({
  labels: blocks.map((b) => b.number.toString()).reverse(),
  datasets: [
    {
      label: "Burnt fees (Gwei)",
      data: blocks
        .map((b) => Number((b.gasUsed * b.baseFeePerGas!) / 10n ** 9n))
        .reverse(),
      fill: true,
      backgroundColor: "#FDBA7470",
      borderColor: "#FB923C",
      tension: 0.2,
    },
    {
      label: "Base fee (wei)",
      data: blocks.map((b) => Number(b.baseFeePerGas!)).reverse(),
      yAxisID: "yBaseFee",
      borderColor: "#38BDF8",
      tension: 0.2,
    },
  ],
});

export const gasChartOptions: ChartOptions<"line"> = {
  animation: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: {
        callback: function (v) {
          // @ts-ignore
          return commify(this.getLabelForValue(v));
        },
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Gas",
      },
    },
    yBaseFee: {
      position: "right",
      beginAtZero: true,
      title: {
        display: true,
        text: "Base fee",
      },
      ticks: {
        callback: (v) => `${(v as number) / 1e9} Gwei`,
      },
      grid: {
        drawOnChartArea: false,
      },
    },
  },
};

export const gasChartData = (blocks: ExtendedBlock[]): ChartData<"line"> => ({
  labels: blocks.map((b) => b.number.toString()).reverse(),
  datasets: [
    {
      label: "Gas used",
      data: blocks.map((b) => Number(b.gasUsed)).reverse(),
      fill: true,
      segment: {
        backgroundColor: (ctx, x) =>
          interpolateColor(
            ctx.p1.parsed.y,
            Number(blocks[ctx.p1DataIndex].gasLimit),
          ) + "70",
        borderColor: (ctx) =>
          interpolateColor(
            ctx.p1.parsed.y,
            Number(blocks[ctx.p1DataIndex].gasLimit),
          ),
      },
      tension: 0.2,
    },
    {
      label: "Gas target",
      data: blocks.map((b) => Math.round(Number(b.gasLimit) / 2)).reverse(),
      borderColor: "#FCA5A5",
      borderDash: [5, 5],
      borderWidth: 2,
      tension: 0.2,
      pointStyle: "dash",
    },
    {
      label: "Gas limit",
      data: blocks.map((b) => Number(b.gasLimit)).reverse(),
      borderColor: "#B91C1CF0",
      tension: 0.2,
      pointStyle: "crossRot",
      pointRadius: 5,
    },
    {
      label: "Base fee (wei)",
      data: blocks.map((b) => Number(b.baseFeePerGas!)).reverse(),
      yAxisID: "yBaseFee",
      borderColor: "#38BDF8",
      tension: 0.2,
    },
  ],
});
