import {
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Line } from "react-chartjs-2";
import ContentFrame from "../../components/ContentFrame";
import { useChainInfo } from "../../useChainInfo";
import { ExtendedBlock, readBlock } from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";
import { commify } from "../../utils/utils";
import { AddressAwareComponentProps } from "../types";

ChartJS.register(
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

interface BlockBal {
  block: ExtendedBlock;
  bal: bigint;
}

const NUM_DAYS_HISTORY = 90;

function getBalanceChartOptions(symbol: string): ChartOptions<"line"> {
  return {
    animation: false,
    plugins: {
      legend: {
        display: false,
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
          callback: (v) => `${commify(v)} ${symbol}`,
        },
      },
    },
  };
}

const balanceChartData = (
  blocksAndBals: BlockBal[],
  decimals: number,
): ChartData<"line"> => ({
  labels: blocksAndBals
    .map((b) => new Date(b.block.timestamp * 1000))
    .reverse(),
  datasets: [
    {
      label: "Balance",
      data: blocksAndBals.map((b) => Number(b.bal) / 10 ** decimals).reverse(),
      yAxisID: "y",
      borderColor: "#000000",
      tension: 0.2,
    },
  ],
});

const AddressBalance: FC<AddressAwareComponentProps> = ({ address }) => {
  const { provider } = useContext(RuntimeContext);
  const [blocksAndBals, setBlocksAndBals] = useState<BlockBal[]>([]);
  const {
    nativeCurrency: { symbol: currencySymbol, decimals: currencyDecimals },
  } = useChainInfo();

  const getBlockAndBalance = useCallback(
    async (blockNumber: number) => {
      if (!provider) {
        return;
      }

      const extBlock = await readBlock(provider, blockNumber.toString());
      const addrBal = await provider.getBalance(address, blockNumber);
      setBlocksAndBals((_blocks) => {
        for (let i = 0; i < _blocks.length; i++) {
          if (_blocks[i].block.number === blockNumber) {
            // Block already in list
            return _blocks;
          }
        }
        if (extBlock === null) {
          return _blocks;
        }

        const newBlocks = [{ block: extBlock, bal: addrBal }, ..._blocks];
        newBlocks.sort((a, b) => b.block.number - a.block.number);
        return newBlocks;
      });
    },
    [provider],
  );

  const data = useMemo(
    () => balanceChartData(blocksAndBals, currencyDecimals),
    [blocksAndBals],
  );

  useEffect(() => {
    async function fetchAll() {
      if (!provider) {
        return;
      }
      const latestBlock = await provider.getBlockNumber();
      if (latestBlock === undefined) {
        return;
      }
      const blockPromises: Promise<void>[] = [];
      for (let i = 0; i < NUM_DAYS_HISTORY; i++) {
        const targetBlock = latestBlock - i * 7200;
        if (targetBlock < 0) {
          break;
        }
        blockPromises.push(getBlockAndBalance(targetBlock));
      }
      await Promise.all(blockPromises);
    }

    setBlocksAndBals([]);
    fetchAll();
  }, []);

  return (
    <ContentFrame tabs>
      {provider && (
        <div>
          <Line
            data={data}
            height={100}
            options={getBalanceChartOptions(currencySymbol)}
          />
        </div>
      )}
      {!provider && <div>Loading...</div>}
    </ContentFrame>
  );
};

export default AddressBalance;
