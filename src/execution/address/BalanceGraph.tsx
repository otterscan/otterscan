import { ChartData, ChartOptions } from "chart.js";
import { JsonRpcApiProvider } from "ethers";
import { FC } from "react";
import { type ExtendedBlock } from "../../useErigonHooks";
import { commify } from "../../utils/utils";

import HistoricalDataGraph, { BlockVal } from "./HistoricalDataGraph";

function formatAmount(amt: string | number, symbol: string, decimals: number) {
  // Hack so commify can work with number values like 8e-6
  return `${commify(
    typeof amt === "number" && amt.toString().includes("e")
      ? amt.toLocaleString("fullwide", {
          useGrouping: false,
          maximumSignificantDigits: 21,
        })
      : amt,
  )} ${symbol}`;
}

function balanceChartOptions(
  symbol: string,
  decimals: number,
): ChartOptions<"line"> {
  return {
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => formatAmount(context.parsed.y, symbol, decimals),
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: "day" },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: `${symbol} Balance`,
        },
        ticks: {
          callback: (v) => formatAmount(v, symbol, decimals),
        },
      },
    },
  };
}

const balanceChartData = (
  blockVals: BlockVal[],
  decimals: number,
): ChartData<"line"> => ({
  labels: blockVals.map((b) => new Date(b.block.timestamp * 1000)).reverse(),
  datasets: [
    {
      label: "Balance",
      data: blockVals.map((b) => Number(b.val) / 10 ** decimals).reverse(),
      yAxisID: "y",
      borderColor: "#000000",
      tension: 0.2,
    },
  ],
});

interface BalanceGraphProps {
  currencySymbol: string;
  currencyDecimals: number;
  balanceAtBlock: (
    provider: JsonRpcApiProvider,
    block: ExtendedBlock,
  ) => Promise<bigint | null>;
}

const BalanceGraph: FC<BalanceGraphProps> = ({
  currencySymbol,
  currencyDecimals,
  balanceAtBlock,
}) => {
  return (
    <HistoricalDataGraph
      perBlockFetch={(provider, block) => balanceAtBlock(provider, block)}
      chartOptions={balanceChartOptions(currencySymbol, currencyDecimals)}
      chartData={(blockVals) =>
        balanceChartData(blockVals, Number(currencyDecimals))
      }
    />
  );
};

export default BalanceGraph;
