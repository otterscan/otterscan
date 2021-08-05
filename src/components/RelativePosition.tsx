import React from "react";

type RelativePositionProps = {
  pos: React.ReactNode;
  total: React.ReactNode;
};

const RelativePosition: React.FC<RelativePositionProps> = ({ pos, total }) => (
  <span className="text-xs">
    {pos}
    <span className="text-gray-600 text-sm"> / {total}</span>
  </span>
);

export default React.memo(RelativePosition);
