import { FC, lazy, memo } from "react";

const HighlightedSource = lazy(() => import("./HighlightedSource"));

type HighlightedSolidityProps = {
  source?: string | null;
};

const HighlightedSolidity: FC<HighlightedSolidityProps> = ({ source }) => {
  return <HighlightedSource source={source} langName="solidity" />;
};

export default memo(HighlightedSolidity);
