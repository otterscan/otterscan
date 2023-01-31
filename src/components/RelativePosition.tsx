import React from "react";

type RelativePositionProps = {
  pos: React.ReactNode;
  total: React.ReactNode;
};

const RelativePosition: React.FC<RelativePositionProps> = ({ pos, total }) => (
  <span className="text-xs">
    {pos}
    <span className="text-sm text-gray-600"> / {total}</span>
  </span>
);

export default React.memo(RelativePosition);
