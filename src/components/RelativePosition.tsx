import { FC, memo, ReactNode } from "react";

type RelativePositionProps = {
  pos: ReactNode;
  total: ReactNode;
};

const RelativePosition: FC<RelativePositionProps> = ({ pos, total }) => (
  <span className="text-xs whitespace-nowrap">
    {pos}
    <span className="text-sm text-gray-600"> / {total}</span>
  </span>
);

export default memo(RelativePosition);
