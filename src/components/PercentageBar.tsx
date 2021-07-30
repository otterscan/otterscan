import React from "react";

type PercentageBarProps = {
  perc: number;
};

const PercentageBar: React.FC<PercentageBarProps> = ({ perc }) => (
  <div className="self-center w-40 border rounded border-gray-200">
    <div className="w-full h-5 rounded bg-gradient-to-r from-red-400 via-yellow-300 to-green-400 relative">
      <div
        className="absolute top-0 right-0 bg-white h-full rounded-r"
        style={{ width: `${100 - perc}%` }}
      ></div>
      <div className="w-full h-full absolute flex mix-blend-multiply text-sans text-gray-600">
        <span className="m-auto">{perc}%</span>
      </div>
    </div>
  </div>
);

export default React.memo(PercentageBar);
