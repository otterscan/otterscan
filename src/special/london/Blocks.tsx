import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { ethers, FixedNumber } from "ethers";
import { Line } from "react-chartjs-2";
import { Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBurn,
  faCoins,
  faCube,
  faGasPump,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import BlockRow from "./BlockRow";
import { ExtendedBlock, readBlock } from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";
import {
  burntFeesChartOptions,
  burntFeesChartData,
  gasChartOptions,
  gasChartData,
} from "./chart";

const MAX_BLOCK_HISTORY = 20;

const PREV_BLOCK_COUNT = 15;

type BlocksProps = {
  latestBlock: ethers.providers.Block;
  targetBlockNumber: number;
};

const Blocks: React.FC<BlocksProps> = ({ latestBlock, targetBlockNumber }) => {
  const { provider } = useContext(RuntimeContext);
  const [blocks, setBlocks] = useState<ExtendedBlock[]>([]);
  const [now, setNow] = useState<number>(Date.now());
  const [toggleChart, setToggleChart] = useState<boolean>(true);

  const addBlock = useCallback(
    async (blockNumber: number) => {
      if (!provider) {
        return;
      }

      // Skip blocks before the hard fork during the transition
      if (blockNumber < targetBlockNumber) {
        return;
      }

      const extBlock = await readBlock(provider, blockNumber.toString());
      setNow(Date.now());
      setBlocks((_blocks) => {
        if (_blocks.length > 0 && blockNumber === _blocks[0].number) {
          return _blocks;
        }

        // Leave the last block because of transition animation
        const newBlocks = [extBlock, ..._blocks].slice(
          0,
          MAX_BLOCK_HISTORY + 1
        );

        // Little hack to fix out of order block notifications
        newBlocks.sort((a, b) => b.number - a.number);
        return newBlocks;
      });
    },
    [provider, targetBlockNumber]
  );

  useEffect(() => {
    addBlock(latestBlock.number);
  }, [addBlock, latestBlock]);

  const data = useMemo(
    () => (toggleChart ? gasChartData(blocks) : burntFeesChartData(blocks)),
    [toggleChart, blocks]
  );
  const chartOptions = toggleChart ? gasChartOptions : burntFeesChartOptions;

  // On page reload, pre-populate the last N blocks
  useEffect(
    () => {
      const addPreviousBlocks = async () => {
        for (
          let i = latestBlock.number - PREV_BLOCK_COUNT;
          i < latestBlock.number;
          i++
        ) {
          await addBlock(i);
        }
      };

      setBlocks([]);
      addPreviousBlocks();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="w-full mb-auto">
      <div className="px-9 pt-3 pb-12 divide-y-2">
        <div className="relative">
          <div className="flex justify-center items-baseline space-x-2 px-3 pb-2 text-lg text-orange-500 ">
            <span>
              <FontAwesomeIcon icon={faBurn} />
            </span>
            <span>EIP-1559 is activated. Watch the fees burn.</span>
            <span>
              <FontAwesomeIcon icon={faBurn} />
            </span>
          </div>
          <div className="absolute right-0 top-0 border rounded shadow-md px-2 py-1 text-sm text-link-blue hover:bg-gray-50 hover:text-link-blue-hover">
            <button onClick={() => setToggleChart(!toggleChart)}>
              {toggleChart ? "Gas usage" : "Burnt fees"}
            </button>
          </div>
        </div>
        <div>
          <Line data={data} height={100} options={chartOptions} />
        </div>
        <div className="mt-5 grid grid-cols-9 gap-x-2 px-3 py-2">
          <div className="flex space-x-1 items-baseline">
            <span className="text-gray-500">
              <FontAwesomeIcon icon={faCube} />
            </span>
            <span>Block</span>
          </div>
          <div className="text-right flex space-x-1 justify-end items-baseline">
            <span className="text-gray-500">
              <FontAwesomeIcon icon={faGasPump} />
            </span>
            <span>Gas used</span>
          </div>
          <div className="text-right">Gas target</div>
          <div className="text-right">Base fee</div>
          <div className="text-right col-span-2 flex space-x-1 justify-end items-baseline">
            <span className="text-yellow-400">
              <FontAwesomeIcon icon={faCoins} />
            </span>
            <span>Rewards</span>
          </div>
          <div className="text-right col-span-2 flex space-x-1 justify-end items-baseline">
            <span className="text-orange-500">
              <FontAwesomeIcon icon={faBurn} />
            </span>
            <span>Burnt fees</span>
          </div>
          <div className="text-right flex space-x-1 justify-end items-baseline">
            <span className="text-gray-500">
              <FontAwesomeIcon icon={faHistory} />
            </span>
            <span>Age</span>
          </div>
        </div>
        {blocks.map((b, i, all) => (
          <Transition
            key={b.hash}
            show={i < MAX_BLOCK_HISTORY}
            appear
            enter="transition transform ease-out duration-500"
            enterFrom="opacity-0 -translate-y-10"
            enterTo="opacity-100 translate-y-0"
            leave="transition transform ease-out duration-1000"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-10"
          >
            <BlockRow
              now={now}
              block={b}
              baseFeeDelta={
                i < all.length - 1
                  ? FixedNumber.from(b.baseFeePerGas!)
                      .divUnsafe(FixedNumber.from(1e9))
                      .round(0)
                      .subUnsafe(
                        FixedNumber.from(all[i + 1].baseFeePerGas!)
                          .divUnsafe(FixedNumber.from(1e9))
                          .round(0)
                      )
                      .toUnsafeFloat()
                  : 0
              }
            />
          </Transition>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Blocks);
