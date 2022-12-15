import { FC } from "react";
import { SlotAwareComponentProps } from "../types";
import HexValue from "../../components/HexValue";
import { useBlockRoot } from "../../useConsensus";

const BlockRoot: FC<SlotAwareComponentProps> = ({ slotNumber }) => {
  const { blockRoot } = useBlockRoot(slotNumber);

  return <div>{blockRoot !== undefined && <HexValue value={blockRoot} />}</div>;
};

export default BlockRoot;
