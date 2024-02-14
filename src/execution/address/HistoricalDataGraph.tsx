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
import { JsonRpcApiProvider } from "ethers";
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Line } from "react-chartjs-2";
import { ExtendedBlock, readBlock } from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";

ChartJS.register(
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

const NUM_DAYS_HISTORY = 90;
const BLOCKS_PER_DAY = 7200;

export interface BlockVal {
  block: ExtendedBlock;
  val: bigint;
}

interface HistoricalDataGraphProps {
  perBlockFetch: (
    provider: JsonRpcApiProvider,
    block: ExtendedBlock,
  ) => Promise<bigint | null>;
  chartOptions: ChartOptions<"line">;
  chartData: (blockVals: BlockVal[]) => ChartData<"line">;
  blockSeparation?: number;
  pointCount?: number;
}

const HistoricalDataGraph: FC<HistoricalDataGraphProps> = ({
  perBlockFetch,
  chartOptions,
  chartData,
  blockSeparation = BLOCKS_PER_DAY,
  pointCount = NUM_DAYS_HISTORY,
}) => {
  const { provider } = useContext(RuntimeContext);
  const [blockVals, setBlockVals] = useState<BlockVal[]>([]);

  const getBlockVal = useCallback(
    async (blockNumber: number) => {
      if (!provider) {
        return;
      }

      const extBlock = await readBlock(provider, blockNumber.toString());
      if (extBlock === null) {
        return;
      }
      const val = await perBlockFetch(provider, extBlock);
      if (val === null) {
        return;
      }
      setBlockVals((_blocks) => {
        for (let i = 0; i < _blocks.length; i++) {
          if (_blocks[i].block.number === blockNumber) {
            // Block already in list
            return _blocks;
          }
        }

        const newBlocks = [{ block: extBlock, val }, ..._blocks];
        newBlocks.sort((a, b) => b.block.number - a.block.number);
        return newBlocks;
      });
    },
    [provider],
  );

  const data = useMemo(() => chartData(blockVals), [blockVals]);

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
        blockPromises.push(getBlockVal(targetBlock));
      }
      await Promise.all(blockPromises);
    }

    setBlockVals([]);
    fetchAll();
  }, []);

  return (
    <div>
      {provider && <Line data={data} height={100} options={chartOptions} />}
      {!provider && "Loading..."}
    </div>
  );
};

export default HistoricalDataGraph;
