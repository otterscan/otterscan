import { FC, lazy, memo } from "react";
import { DecorationOptions } from "shiki";

const HighlightedSource = lazy(() => import("./HighlightedSource"));

type HighlightedSolidityProps = {
  source?: string | null;
  decorations?: DecorationOptions["decorations"];
};

const HighlightedSolidity: FC<HighlightedSolidityProps> = ({
  source,
  decorations,
}) => {
  return (
    <HighlightedSource
      source={source}
      langName="solidity"
      decorations={decorations}
    />
  );
};

export default memo(HighlightedSolidity);
