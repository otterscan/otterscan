import { FC, memo } from "react";
import StandardSubtitle from "../../components/StandardSubtitle";
import EpochNavBlock from "../components/EpochNavBlock";
import { EpochAwareComponentProps } from "../types";

const EpochSubtitle: FC<EpochAwareComponentProps> = ({ epochNumber }) => (
  <StandardSubtitle>
    <div className="flex items-baseline space-x-1">
      <span>Epoch</span>
      <span className="text-base text-gray-500">#{epochNumber}</span>
      <EpochNavBlock epochNumber={epochNumber} />
    </div>
  </StandardSubtitle>
);

export default memo(EpochSubtitle);
