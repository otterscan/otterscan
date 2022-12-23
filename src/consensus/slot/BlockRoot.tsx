import { FC } from "react";
import { SlotAwareComponentProps } from "../types";
import HexValue from "../../components/HexValue";
import { useBlockRoot } from "../../useConsensus";

const BlockRoot: FC<SlotAwareComponentProps> = ({ slotNumber }) => {
  const { blockRoot } = useBlockRoot(slotNumber);
  if (blockRoot === undefined) {
    return <></>;
  }

  return <HexValue value={blockRoot} />;
};

export default BlockRoot;
