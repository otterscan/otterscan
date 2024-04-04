import { FC, lazy } from "react";

import React from "react";

const HighlightedSource = lazy(() => import("./HighlightedSource"));

type HighlightedSolidityProps = {
  source?: string | null;
};

const HighlightedSolidity: FC<HighlightedSolidityProps> = ({ source }) => {
  return <HighlightedSource source={source} langName="solidity" />;
};

export default React.memo(HighlightedSolidity);
