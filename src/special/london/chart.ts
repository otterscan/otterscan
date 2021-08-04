import { ethers } from "ethers";
import { ChartData, ChartOptions } from "chart.js";
import { ExtendedBlock } from "../../useErigonHooks";

export const options: ChartOptions = {
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
        callback: (v) => `${v} Gwei`,
      },
    },
  },
};

export const toChartData = (blocks: ExtendedBlock[]): ChartData => ({
  labels: blocks.map((b) => b.number.toString()).reverse(),
  datasets: [
    {
      label: "Burnt fees (Gwei)",
      data: blocks
        .map((b) => b.gasUsed.mul(b.baseFeePerGas!).toNumber() / 1e9)
        .reverse(),
      fill: true,
      backgroundColor: "#FDBA74",
      borderColor: "#F97316",
      tension: 0.2,
    },
  ],
});
