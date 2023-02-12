import { FC } from "react";
import NavBlock from "./NavBlock";
import { EPOCHS_AFTER_HEAD, useHeadEpochNumber } from "../../useConsensus";
import { EpochAwareComponentProps } from "../types";
import { epochURL } from "../../url";

const EpochNavBlock: FC<EpochAwareComponentProps> = ({ epochNumber }) => {
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
