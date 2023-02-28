import React, { useContext } from "react";
import { BlockTag } from "@ethersproject/abstract-provider";
import StandardSubtitle from "../StandardSubtitle";
import BlockLink from "../components/BlockLink";
import NavBlock from "../components/NavBlock";
import { RuntimeContext } from "../useRuntime";
import { useLatestBlockNumber } from "../useLatestBlock";
import { blockTxsURL } from "../url";

type BlockTransactionHeaderProps = {
  blockTag: BlockTag;
};

const BlockTransactionHeader: React.FC<BlockTransactionHeaderProps> = ({
  blockTag,
}) => {
  const { provider } = useContext(RuntimeContext);
  const latestBlockNumber = useLatestBlockNumber(provider);

  return (
    <StandardSubtitle>
      <div className="flex items-baseline space-x-1">
        <span>Transactions</span>
        <div className="flex space-x-1 text-sm text-gray-500">
          <span>For Block</span>
          <BlockLink blockTag={blockTag} />
          <NavBlock
            entityNum={blockTag as number}
            latestEntityNum={latestBlockNumber}
            urlBuilder={blockTxsURL}
          />
        </div>
      </div>
    </StandardSubtitle>
  );
};

export default React.memo(BlockTransactionHeader);
