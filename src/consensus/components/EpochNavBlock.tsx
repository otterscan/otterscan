import { FC } from "react";
import NavBlock from "../../components/NavBlock";
import { epochURL } from "../../url";
import { EPOCHS_AFTER_HEAD, useHeadEpochNumber } from "../../useConsensus";
import { EpochAwareComponentProps } from "../types";

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
