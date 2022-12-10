import { FC } from "react";
import NavBlock from "./NavBlock";
import { EPOCHS_AFTER_HEAD, useHeadEpochNumber } from "../../useConsensus";
import { epochURL } from "../../url";

type EpochNavBlockProps = {
  epochNumber: number;
};

const EpochNavBlock: FC<EpochNavBlockProps> = ({ epochNumber }) => {
  const headEpochNumber = useHeadEpochNumber();

  return (
    <>
      {headEpochNumber !== undefined && (
        <NavBlock
          entityNum={epochNumber}
          latestEntityNum={headEpochNumber + EPOCHS_AFTER_HEAD}
          urlBuilder={epochURL}
        />
      )}
    </>
  );
};

export default EpochNavBlock;
