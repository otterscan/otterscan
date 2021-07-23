import React, { useContext } from "react";
import { ethers } from "ethers";
import StandardSubtitle from "../StandardSubtitle";
import BlockLink from "../components/BlockLink";
import NavBlock from "./NavBlock";
import { RuntimeContext } from "../useRuntime";
import { useLatestBlockNumber } from "../useLatestBlock";
import { blockTxsURL } from "../url";

type BlockTransactionHeaderProps = {
  blockTag: ethers.providers.BlockTag;
};

const BlockTransactionHeader: React.FC<BlockTransactionHeaderProps> = ({
  blockTag,
}) => {
  const { provider } = useContext(RuntimeContext);
  const latestBlockNumber = useLatestBlockNumber(provider);

  return (
    <StandardSubtitle>
      <div className="flex space-x-1 items-baseline">
        <span>Transactions</span>
        <div className="flex space-x-1 text-sm text-gray-500">
          <span>For Block</span>
          <BlockLink blockTag={blockTag} />
          <NavBlock
            blockNumber={blockTag as number}
            latestBlockNumber={latestBlockNumber}
            urlBuilder={blockTxsURL}
          />
        </div>
      </div>
    </StandardSubtitle>
  );
};

export default React.memo(BlockTransactionHeader);
