import { FC, memo } from "react";
import StandardSubtitle from "../../StandardSubtitle";
import EpochNavBlock from "../components/EpochNavBlock";

type EpochSubtitleProps = {
  epochNumber: number;
};

const EpochSubtitle: FC<EpochSubtitleProps> = ({ epochNumber }) => (
  <StandardSubtitle>
    <div className="flex space-x-1 items-baseline">
      <span>Epoch</span>
      <span className="text-base text-gray-500">#{epochNumber}</span>
      {epochNumber && <EpochNavBlock epochNumber={epochNumber} />}
    </div>
  </StandardSubtitle>
);

export default memo(EpochSubtitle);
