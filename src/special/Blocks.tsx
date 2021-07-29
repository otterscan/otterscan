import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBurn, faGasPump } from "@fortawesome/free-solid-svg-icons";
import BlockRecord from "./BlockRecord";
import { ExtendedBlock, readBlock } from "../useErigonHooks";
import { RuntimeContext } from "../useRuntime";

const MAX_BLOCK_HISTORY = 10;

type BlocksProps = {
  latestBlock: ethers.providers.Block;
};

const Blocks: React.FC<BlocksProps> = ({ latestBlock }) => {
  const { provider } = useContext(RuntimeContext);
  const [blocks, setBlock] = useState<ExtendedBlock[]>([]);

  useEffect(() => {
    if (!provider) {
      return;
    }

    const _readBlock = async () => {
      const extBlock = await readBlock(provider, latestBlock.number.toString());
      setBlock((_blocks) => {
        if (_blocks.length > 0 && latestBlock.number === _blocks[0].number) {
          return _blocks;
        }
        return [extBlock, ..._blocks].slice(0, MAX_BLOCK_HISTORY);
      });
    };
    _readBlock();
  }, [provider, latestBlock]);

  return (
    <div className="w-full h-full">
      <div className="m-10 divide-y-2">
        <div className="grid grid-cols-8 px-3 py-2">
          <div>Block</div>
          <div className="text-right">Base fee</div>
          <div className="text-right flex space-x-1 justify-end items-baseline">
            <span className="text-gray-500">
              <FontAwesomeIcon icon={faGasPump} />
            </span>
            <span>Gas used</span>
          </div>
          <div className="text-right flex space-x-1 justify-end items-baseline">
            <span className="text-orange-500">
              <FontAwesomeIcon icon={faBurn} />
            </span>
            <span>Burnt fees</span>
          </div>
          <div className="text-right">Gas target</div>
          <div className="text-right col-span-2">Rewards</div>
        </div>
        {blocks.map((b) => (
          <BlockRecord key={b.hash} block={b} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(Blocks);
