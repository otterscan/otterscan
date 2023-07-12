import { FC, memo } from "react";
import { ageString } from "../utils/utils";

type AgeProps = {
  durationInSecs: number;
  title?: string;
};

const Age: FC<AgeProps> = ({ durationInSecs, title }) => {
  const desc = ageString(durationInSecs);

  return (
    <span className="truncate" title={title ?? desc}>
      {desc}
    </span>
  );
};

export default memo(Age);
