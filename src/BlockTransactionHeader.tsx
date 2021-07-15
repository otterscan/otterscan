import React from "react";
import { ethers } from "ethers";
import StandardSubtitle from "./StandardSubtitle";
import BlockLink from "./components/BlockLink";

type BlockTransactionHeaderProps = {
  blockTag: ethers.providers.BlockTag;
};

const BlockTransactionHeader: React.FC<BlockTransactionHeaderProps> = ({
  blockTag,
}) => (
  <>
    <StandardSubtitle>Transactions</StandardSubtitle>
    <div className="pb-2 text-sm text-gray-500">
      For Block <BlockLink blockTag={blockTag} />
    </div>
  </>
);

export default React.memo(BlockTransactionHeader);
