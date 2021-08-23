import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import { Block } from "@ethersproject/abstract-provider";
import { FixedNumber } from "@ethersproject/bignumber";
import { Line } from "react-chartjs-2";
import { Listbox, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons/faAngleDown";
import { faBurn } from "@fortawesome/free-solid-svg-icons/faBurn";
import { faCoins } from "@fortawesome/free-solid-svg-icons/faCoins";
import { faCube } from "@fortawesome/free-solid-svg-icons/faCube";
import { faGasPump } from "@fortawesome/free-solid-svg-icons/faGasPump";
import { faHistory } from "@fortawesome/free-solid-svg-icons/faHistory";
import BlockRow from "./BlockRow";
import Label from "./Label";
import FormattedValue from "./components/FormattedValue";
import { readBlockForDashboard } from "./hooks";
import { RuntimeContext } from "../../useRuntime";
import { MAX_BLOCK_HISTORY, PREV_BLOCK_COUNT } from "./params";
import {
  burntFeesChartOptions,
  burntFeesChartData,
  gasChartOptions,
  gasChartData,
  ChartBlock,
  ChartMode,
  cumulativeIssuanceChartData,
  cumulativeIssuanceChartOptions,
} from "./chart";

type BlocksProps = {
  latestBlock: Block;
  londonBlockNumber: number;
};

type PageParams = {
  b?: number;
};

const charts = [
  { id: 0, mode: ChartMode.CUMULATIVE_ISSUANCE, desc: "Total issuance" },
  { id: 1, mode: ChartMode.GAS_USAGE, desc: "Gas usage" },
  { id: 2, mode: ChartMode.BURNT_FEES, desc: "Burnt fees" },
];

const Blocks: React.FC<BlocksProps> = ({ latestBlock, londonBlockNumber }) => {
  const { provider } = useContext(RuntimeContext);
  const [blocks, setBlocks] = useState<ChartBlock[]>([]);
  const [now, setNow] = useState<number>(Date.now());
  const [selectedChart, setSelectedChart] = useState(charts[0]);

  const location = useLocation<PageParams>();
  const qs = queryString.parse(location.search);
  let endBlock = latestBlock.number;
  if (qs.b) {
    try {
      endBlock = parseInt(qs.b as string);
    } catch (err) {}
  }

  const addBlock = useCallback(
    async (blockNumber: number) => {
      if (!provider) {
        return;
      }

      // Skip blocks before the hard fork during the transition
      if (blockNumber < londonBlockNumber) {
        return;
      }

      const extBlock = await readBlockForDashboard(
        provider,
        blockNumber.toString()
      );
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
    [provider, londonBlockNumber]
  );

  useEffect(() => {
    addBlock(endBlock);
  }, [addBlock, endBlock]);

  const data = useMemo(
    () =>
      selectedChart.mode === ChartMode.CUMULATIVE_ISSUANCE
        ? cumulativeIssuanceChartData(blocks)
        : selectedChart.mode === ChartMode.GAS_USAGE
        ? gasChartData(blocks)
        : burntFeesChartData(blocks),
    [selectedChart, blocks]
  );
  const chartOptions =
    selectedChart.mode === ChartMode.CUMULATIVE_ISSUANCE
      ? cumulativeIssuanceChartOptions
      : selectedChart.mode === ChartMode.GAS_USAGE
      ? gasChartOptions
      : burntFeesChartOptions;

  // On page reload, pre-populate the last N blocks
  useEffect(
    () => {
      const addPreviousBlocks = async () => {
        for (let i = endBlock - PREV_BLOCK_COUNT; i < endBlock; i++) {
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
          <div className="w-full mb-2">
            {blocks?.[0] && (
              <div className="flex justify-between items-baseline relative">
                <div className="rounded">
                  <Listbox value={selectedChart} onChange={setSelectedChart}>
                    <Listbox.Button className="w-32 flex justify-between items-baseline space-x-2 border rounded shadow-md px-2 py-1 text-sm text-link-blue hover:bg-gray-50 hover:text-link-blue-hover">
                      <span>{selectedChart.desc}</span>
                      <span>
                        <FontAwesomeIcon icon={faAngleDown} />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute border rounded py-1 mt-1 shadow-md bg-white text-sm text-gray-500">
                      {charts.map((c) => (
                        <Listbox.Option key={c.id} value={c}>
                          {({ active, selected }) => (
                            <li
                              className={`px-2 py-1 cursor-pointer ${
                                active ? "bg-gray-100" : "bg-white"
                              } ${
                                selected ? "text-link-blue bg-gray-100" : ""
                              }`}
                            >
                              {c.desc}
                            </li>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Listbox>
                </div>
                <div className="flex justify-between items-baseline space-x-2">
                  <Label>Total in circulation</Label>
                  <FormattedValue
                    value={FixedNumber.fromValue(
                      blocks[0].totalIssued.sub(blocks[0].totalBurnt),
                      18
                    )
                      .round(2)
                      .toString()}
                    unit="ETH"
                  />
                </div>
                <div className="flex justify-between items-baseline space-x-2">
                  <Label>Total burnt</Label>
                  <FormattedValue
                    value={FixedNumber.fromValue(blocks[0].totalBurnt, 18)
                      .round(2)
                      .toString()}
                    unit="ETH"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-full">
          <Line data={data} height={100} options={chartOptions} />
        </div>
        <div className="mt-5 grid grid-cols-21 gap-x-2 px-3 py-2">
          <div className="col-span-2 flex space-x-1 items-baseline">
            <span className="text-gray-500">
              <FontAwesomeIcon icon={faCube} />
            </span>
            <span>Block</span>
          </div>
          <div className="col-span-3 text-right flex space-x-1 justify-end items-baseline">
            <span className="text-gray-500">
              <FontAwesomeIcon icon={faGasPump} />
            </span>
            <span>Gas used / limit</span>
          </div>
          <div className="col-span-2 text-right flex space-x-1 justify-end items-baseline"></div>
          <div className="col-span-2 text-right">Base fee</div>
          <div className="col-span-2 text-right col-span-2 flex space-x-1 justify-end items-baseline">
            <span className="text-yellow-400">
              <FontAwesomeIcon icon={faCoins} />
            </span>
            <span>Issuance</span>
          </div>
          <div className="col-span-4 text-right col-span-2 flex space-x-1 justify-end items-baseline">
            <span className="text-orange-500">
              <FontAwesomeIcon icon={faBurn} />
            </span>
            <span>Burnt fees</span>
          </div>
          <div className="col-span-4 text-right col-span-2 flex space-x-1 justify-end items-baseline">
            <span className="text-gray-400">
              <FontAwesomeIcon icon={faCoins} />
            </span>
            <span>Miner fees</span>
          </div>
          <div className="col-span-2 text-right flex space-x-1 justify-end items-baseline">
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
