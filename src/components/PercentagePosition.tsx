import React from "react";

type PercentagePositionProps = {
  perc: number;
};

const PercentagePosition: React.FC<PercentagePositionProps> = ({ perc }) => (
  <div className="self-center w-40">
    <div className="w-full h-5 relative rounded border border-orange-200">
      <div className="absolute w-full h-1/2 border-b"></div>
      <div className="absolute top-1/4 w-full h-1/2 border-l-2 border-r-2 border-gray-300"></div>
      <div className="absolute top-1/4 w-1/2 h-1/2 border-r-2 border-gray-300"></div>
      <div className="absolute top-1/4 w-1/4 h-1/2 border-r-2 border-gray-300"></div>
      <div className="absolute top-1/4 w-3/4 h-1/2 border-r-2 border-gray-300"></div>
      <div
        className="absolute h-full border-r-4 border-black"
        style={{ width: `${perc * 100}%` }}
      ></div>
    </div>
  </div>
);

export default React.memo(PercentagePosition);
