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
    yBaseFee: {
      position: "right",
      beginAtZero: true,
      title: {
        display: true,
        text: "Base fee",
      },
      grid: {
        drawOnChartArea: false
      }
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
      backgroundColor: "#FDBA7470",
      borderColor: "#FB923C",
      tension: 0.2,
    },
    {
      label: "Base fee (Gwei)",
      data: blocks.map(b => b.baseFeePerGas!.toNumber()).reverse(),
      yAxisID: "yBaseFee",
      borderColor: "#38BDF8",
      tension: 0.2
    }
  ],
});
