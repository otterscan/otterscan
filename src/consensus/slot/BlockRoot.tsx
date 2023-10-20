import { FC } from "react";
import HexValue from "../../components/HexValue";
import { useBlockRoot } from "../../useConsensus";
import { SlotAwareComponentProps } from "../types";

const BlockRoot: FC<SlotAwareComponentProps> = ({ slotNumber }) => {
  const { blockRoot } = useBlockRoot(slotNumber);
  if (blockRoot === undefined) {
    return <></>;
  }

  return <HexValue value={blockRoot} />;
};

export default BlockRoot;
