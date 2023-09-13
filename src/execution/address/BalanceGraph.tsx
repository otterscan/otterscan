import { ChartData, ChartOptions } from "chart.js";
import { JsonRpcApiProvider } from "ethers";
import { FC } from "react";
import ContentFrame from "../../components/ContentFrame";
import { type ExtendedBlock } from "../../useErigonHooks";

import HistoricalDataGraph, { BlockVal } from "./HistoricalDataGraph";

function balanceChartOptions(symbol: string): ChartOptions<"line"> {
  return {
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => context.parsed.y + " " + symbol,
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
          // TODO: FixedNumber so commify works
          callback: (v) => `${v} ${symbol}`,
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
    <ContentFrame tabs>
      <HistoricalDataGraph
        perBlockFetch={(provider, block) => balanceAtBlock(provider, block)}
        chartOptions={balanceChartOptions(currencySymbol)}
        chartData={(blockVals) =>
          balanceChartData(blockVals, Number(currencyDecimals))
        }
      />
    </ContentFrame>
  );
};

export default BalanceGraph;
