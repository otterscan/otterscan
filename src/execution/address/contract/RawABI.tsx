import { FC, lazy, memo } from "react";
import { ABIAwareComponentProps } from "../../types";

const HighlightedSource = lazy(() => import("./HighlightedSource"));

const RawABI: FC<ABIAwareComponentProps> = ({ abi }) => (
  <div className="h-60 w-full border font-code text-base overflow-auto">
    <HighlightedSource
      source={JSON.stringify(abi, null, "  ") ?? ""}
      langName="json"
    />
  </div>
);

export default memo(RawABI);
