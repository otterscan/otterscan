import { FC, memo } from "react";

type PercentageBarProps = {
  perc: number;
};

// TODO: fix horizontal misaligment between app and storybook
const PercentageBar: FC<PercentageBarProps> = ({ perc }) => (
  <div className="w-40 self-center rounded-sm border border-gray-200">
    <div className="relative h-5 w-full rounded-sm bg-linear-to-r from-red-400 via-amber-300 to-emerald-400">
      <div
        className="absolute right-0 top-0 h-full rounded-r bg-white"
        style={{ width: `${100 - perc}%` }}
      ></div>
      <div className="text-sans absolute flex h-full w-full text-gray-600 mix-blend-multiply">
        <span className="m-auto">{perc}%</span>
      </div>
    </div>
  </div>
);

export default memo(PercentageBar);
