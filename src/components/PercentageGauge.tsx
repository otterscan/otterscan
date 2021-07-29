import React from "react";

type PercentageGaugeProps = {
  perc: number;
  bgFull: string;
  bgPerc: string;
  textPerc: string;
};

const PercentageGauge: React.FC<PercentageGaugeProps> = ({
  perc,
  bgFull,
  bgPerc,
  textPerc,
}) => (
  <div className="w-60 h-6 border-l-2 border-gray-400 relative">
    <div className="flex absolute w-full h-full">
      <div className={`my-auto h-5 rounded-r-lg w-full ${bgFull}`}></div>
    </div>
    <div className="flex absolute w-full h-full">
      <div
        className={`my-auto h-5 rounded-r-lg ${bgPerc}`}
        style={{ width: `${perc}%` }}
      ></div>
    </div>
    <div
      className={`flex absolute w-full h-full mix-blend-multiply text-sans ${textPerc}`}
    >
      <span className="m-auto">{perc}%</span>
    </div>
  </div>
);

export default React.memo(PercentageGauge);
