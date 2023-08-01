import { FC, ReactNode, memo } from "react";
import PageControl from "./PageControl";

type RecentNavBarProps = {
    isLoading : boolean
};

const RecentNavBar: FC<RecentNavBarProps> = ({ isLoading }) => (
  <div className="flex items-baseline justify-between py-3">
    <div className="text-sm text-gray-500">
      {isLoading
        ? "Waiting for blocks..."
        : "Transaction Blocks"}
    </div>
  </div>
);

export default memo(RecentNavBar);
