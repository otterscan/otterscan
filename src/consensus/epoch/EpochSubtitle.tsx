import { FC, memo } from "react";
import StandardSubtitle from "../../StandardSubtitle";
import EpochNavBlock from "../components/EpochNavBlock";

type EpochSubtitleProps = {
  epochNumber: number;
};

const EpochSubtitle: FC<EpochSubtitleProps> = ({ epochNumber }) => (
  <StandardSubtitle>
    <div className="flex items-baseline space-x-1">
      <span>Epoch</span>
      <span className="text-base text-gray-500">#{epochNumber}</span>
      <EpochNavBlock epochNumber={epochNumber} />
    </div>
  </StandardSubtitle>
);

export default memo(EpochSubtitle);
