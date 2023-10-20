import { FC, memo } from "react";

type RecentNavBarProps = {
    isLoading : boolean
};

const ChainInfoHeader: FC<RecentNavBarProps> = ({ isLoading }) => (
  <div className="flex items-baseline justify-between py-3">
    <div className="text-sm text-gray-500">
      {isLoading
        ? "Waiting for blocks..."
        : "Chain Info"}
    </div>
  </div>
);

export default memo(ChainInfoHeader);
