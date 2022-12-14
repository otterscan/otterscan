import { FC } from "react";
import HexValue from "../../components/HexValue";
import { useBlockRoot } from "../../useConsensus";

type BlockRootProps = {
  slotNumber: number;
};

const BlockRoot: FC<BlockRootProps> = ({ slotNumber }) => {
  const { blockRoot } = useBlockRoot(slotNumber);

  return <div>{blockRoot !== undefined && <HexValue value={blockRoot} />}</div>;
};

export default BlockRoot;
