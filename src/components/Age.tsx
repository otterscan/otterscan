import { FC, memo } from "react";
import { ageString } from "../utils/utils";

type AgeProps = {
  durationInSecs: number;
};

const Age: FC<AgeProps> = ({ durationInSecs }) => {
  const desc = ageString(durationInSecs);

  return (
    <span className="truncate" title={desc}>
      {desc}
    </span>
  );
};

export default memo(Age);
