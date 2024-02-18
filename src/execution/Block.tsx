import { isHexString } from "ethers";
import React, { useContext } from "react";
import { useParams } from "react-router";
import NavBlock from "../components/NavBlock";
import StandardFrame from "../components/StandardFrame";
import StandardSubtitle from "../components/StandardSubtitle";
import { blockURL } from "../url";
import { useBlockData } from "../useErigonHooks";
import { useLatestBlockNumber } from "../useLatestBlock";
import { RuntimeContext } from "../useRuntime";
import { useBlockPageTitle } from "../useTitle";
import BlockDetails from "./BlockDetails";

const Block: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const { blockNumberOrHash } = useParams();
  if (blockNumberOrHash === undefined) {
    throw new Error("blockNumberOrHash couldn't be undefined here");
  }
  const { data: block, isLoading } = useBlockData(provider, blockNumberOrHash);
  let blockNumber = isHexString(blockNumberOrHash)
    ? block && block.number !== undefined
      ? block.number
      : undefined
    : parseInt(blockNumberOrHash);
  let latestBlockNumber = useLatestBlockNumber(provider);
  if (blockNumber === undefined) {
    // Disable navigation while the block hash's block number is unknown
    blockNumber = 0;
    latestBlockNumber = undefined;
  }

  useBlockPageTitle(blockNumberOrHash);

  return (
    <StandardFrame>
      <StandardSubtitle>
        <div className="flex items-baseline space-x-1">
          <span>Block</span>
          <span className="text-base text-gray-500" data-test="block-number">
            #{blockNumberOrHash}
          </span>
          <NavBlock
            entityNum={blockNumber}
            latestEntityNum={latestBlockNumber}
            urlBuilder={blockURL}
          />
        </div>
      </StandardSubtitle>
      <BlockDetails />
    </StandardFrame>
  );
};

export default Block;
