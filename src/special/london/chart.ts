import { ethers } from "ethers";
import { ChartData, ChartOptions } from "chart.js";
import { ExtendedBlock } from "../../useErigonHooks";

export const burntFeesChartOptions: ChartOptions = {
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
          return ethers.utils.commify(this.getLabelForValue(v));
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

export const burntFeesChartData = (blocks: ExtendedBlock[]): ChartData => ({
  labels: blocks.map((b) => b.number.toString()).reverse(),
  datasets: [
    {
      label: "Burnt fees (Gwei)",
      data: blocks
        .map((b) => b.gasUsed.mul(b.baseFeePerGas!).div(1e9).toNumber())
        .reverse(),
      fill: true,
      backgroundColor: "#FDBA7470",
      borderColor: "#FB923C",
      tension: 0.2,
    },
    {
      label: "Base fee (wei)",
      data: blocks.map((b) => b.baseFeePerGas!.toNumber()).reverse(),
      yAxisID: "yBaseFee",
      borderColor: "#38BDF8",
      tension: 0.2,
    },
  ],
});

export const gasChartOptions: ChartOptions = {
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
          return ethers.utils.commify(this.getLabelForValue(v));
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

export const gasChartData = (blocks: ExtendedBlock[]): ChartData => ({
  labels: blocks.map((b) => b.number.toString()).reverse(),
  datasets: [
    {
      label: "Gas used",
      data: blocks.map((b) => b.gasUsed.toNumber()).reverse(),
      fill: true,
      segment: {
        backgroundColor: (ctx, x) =>
          ctx.p1.parsed.y >
          Math.round(blocks[ctx.p1DataIndex].gasLimit.toNumber() / 2)
            ? "#22C55E70"
            : "#EF444470",
        borderColor: (ctx) =>
          ctx.p1.parsed.y >
          Math.round(blocks[ctx.p1DataIndex].gasLimit.toNumber() / 2)
            ? "#22C55E"
            : "#EF4444",
      },
      tension: 0.2,
    },
    {
      label: "Gas target",
      data: blocks.map((b) => Math.round(b.gasLimit.toNumber() / 2)).reverse(),
      borderColor: "#FCA5A5",
      borderDash: [5, 5],
      borderWidth: 2,
      tension: 0.2,
      pointStyle: "dash",
    },
    {
      label: "Gas limit",
      data: blocks.map((b) => b.gasLimit.toNumber()).reverse(),
      borderColor: "#B91C1CF0",
      tension: 0.2,
      pointStyle: "crossRot",
      radius: 5,
    },
    {
      label: "Base fee (wei)",
      data: blocks.map((b) => b.baseFeePerGas!.toNumber()).reverse(),
      yAxisID: "yBaseFee",
      borderColor: "#38BDF8",
      tension: 0.2,
    },
  ],
});
