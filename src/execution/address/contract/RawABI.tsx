import { FC, memo } from "react";
import { ABIAwareComponentProps } from "../../types";
import HighlightedSource from "./HighlightedSource";

type HighlightedSolidityProps = {
  source?: string | null;
};

const RawABI: FC<ABIAwareComponentProps> = ({ abi }) => {
  return (
    <div className="h-60 w-full border font-code text-base overflow-auto">
      <HighlightedSource
        source={JSON.stringify(abi, null, "  ") ?? ""}
        langName="json"
      />
    </div>
  );
};

export default memo(RawABI);
