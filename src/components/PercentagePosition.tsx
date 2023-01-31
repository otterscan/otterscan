import React from "react";

type PercentagePositionProps = {
  perc: number;
};

const PercentagePosition: React.FC<PercentagePositionProps> = ({ perc }) => (
  <div className="w-40 self-center">
    <div className="relative h-5 w-full rounded border border-orange-200">
      <div className="absolute h-1/2 w-full border-b"></div>
      <div className="absolute top-1/4 h-1/2 w-full border-l-2 border-r-2 border-gray-300"></div>
      <div className="absolute top-1/4 h-1/2 w-1/2 border-r-2 border-gray-300"></div>
      <div className="absolute top-1/4 h-1/2 w-1/4 border-r-2 border-gray-300"></div>
      <div className="absolute top-1/4 h-1/2 w-3/4 border-r-2 border-gray-300"></div>
      <div
        className="absolute h-full border-r-4 border-black"
        style={{ width: `${perc * 100}%` }}
      ></div>
    </div>
  </div>
);

export default React.memo(PercentagePosition);
