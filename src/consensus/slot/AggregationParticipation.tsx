import { FC, memo } from "react";
import { getBytes } from "ethers";
import PercentageBar from "../../components/PercentageBar";

type AggregationParticipationProps = {
  hex: string;
};

const AggregationParticipation: FC<AggregationParticipationProps> = ({
  hex,
}) => {
  const bm = Array.from(getBytes(hex));
  const total = bm.length * 8;
  let participation = 0;

  for (let i = 0; i < bm.length; i++) {
    const b = bm.at(i);
    for (let j = 0; j < 8; j++) {
      if (b! & (1 << j)) {
        participation++;
      }
    }
  }

  const perc = Math.round(((participation * 100) / total) * 100) / 100;
  return <PercentageBar perc={perc} />;
};

export default memo(AggregationParticipation);
