import React from "react";

type PercentageGaugeProps = {
  perc: number;
  bgColor: string;
  bgColorPerc: string;
  textColor: string;
};

const PercentageGauge: React.FC<PercentageGaugeProps> = ({
  perc,
  bgColor,
  bgColorPerc,
  textColor,
}) => (
  <div className="w-60 h-6 border-l-2 border-gray-400 relative">
    <div className="flex absolute w-full h-full">
      <div className={`my-auto h-5 rounded-r-lg w-full ${bgColor}`}></div>
    </div>
    <div className="flex absolute w-full h-full">
      <div
        className={`my-auto h-5 rounded-r-lg ${bgColorPerc}`}
        style={{ width: `${perc}%` }}
      ></div>
    </div>
    <div
      className={`flex absolute w-full h-full mix-blend-multiply text-sans ${textColor}`}
    >
      <span className="m-auto">{perc}%</span>
    </div>
  </div>
);

export default React.memo(PercentageGauge);
