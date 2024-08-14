import React, { useContext } from "react";
import { useLatestBlockHeader } from "../../useLatestBlock";
import { RuntimeContext } from "../../useRuntime";
import Blocks from "./Blocks";

const LiveBlocks: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const block = useLatestBlockHeader(provider);
  if (!block) {
    return <div className="grow"></div>;
  }

  return <Blocks latestBlock={block} />;
};

export default React.memo(LiveBlocks);
