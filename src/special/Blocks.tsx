import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBurn,
  faCoins,
  faCube,
  faGasPump,
} from "@fortawesome/free-solid-svg-icons";
import BlockRecord from "./BlockRecord";
import { ExtendedBlock, readBlock } from "../useErigonHooks";
import { RuntimeContext } from "../useRuntime";

const MAX_BLOCK_HISTORY = 20;

type BlocksProps = {
  latestBlock: ethers.providers.Block;
};

const Blocks: React.FC<BlocksProps> = ({ latestBlock }) => {
  const { provider } = useContext(RuntimeContext);
  const [blocks, setBlock] = useState<ExtendedBlock[]>([]);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    if (!provider) {
      return;
    }

    const _readBlock = async () => {
      const extBlock = await readBlock(provider, latestBlock.number.toString());
      setNow(Date.now());
      setBlock((_blocks) => {
        if (_blocks.length > 0 && latestBlock.number === _blocks[0].number) {
          return _blocks;
        }
        return [extBlock, ..._blocks].slice(0, MAX_BLOCK_HISTORY + 1);
      });
    };
    _readBlock();
  }, [provider, latestBlock]);

  return (
    <div className="w-full mb-auto">
      <div className="px-9 pt-3 pb-12 divide-y-2">
        <div className="grid grid-cols-8 px-3 py-2">
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
          <div className="text-right flex space-x-1 justify-end items-baseline">
            <span className="text-orange-500">
              <FontAwesomeIcon icon={faBurn} />
            </span>
            <span>Burnt fees</span>
          </div>
          <div className="text-right">Age</div>
        </div>
        <div className="grid grid-cols-8 px-3 py-3 animate-pulse items-center">
          <div>
            <div className="w-20 h-4 bg-gray-200 rounded-md"></div>
          </div>
          <div className="justify-self-end">
            <div className="w-20 h-4 bg-gray-200 rounded-md"></div>
          </div>
          <div className="justify-self-end">
            <div className="w-20 h-4 bg-gray-200 rounded-md"></div>
          </div>
          <div className="justify-self-end">
            <div className="w-10 h-4 bg-gray-200 rounded-md"></div>
          </div>
          <div className="justify-self-end col-span-2">
            <div className="w-56 h-4 bg-gray-200 rounded-md"></div>
          </div>
          <div className="justify-self-end">
            <div className="w-36 h-4 bg-gray-200 rounded-md"></div>
          </div>
          <div className="justify-self-end">
            <div className="w-36 h-4 bg-gray-200 rounded-md"></div>
          </div>
        </div>
        {blocks.map((b, i) => (
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
            <BlockRecord now={now} block={b} />
          </Transition>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Blocks);
