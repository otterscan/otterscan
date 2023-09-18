import { FC, memo } from "react";
import { NavLink } from "react-router-dom";

type RecentNavBarProps = {
    isLoading : boolean
};

const RecentDSNavBar: FC<RecentNavBarProps> = ({ isLoading }) => (
  <div className="flex items-baseline justify-between py-3">
    <div className="text-sm text-gray-500">
      {isLoading
        ? "Waiting for blocks..."
        : "DS Blocks"}
    </div>
    <NavLink
        className={"text-link-blue hover:text-link-blue-hover truncate"}
        to={`/dsblocklist`}
        title={"View All"}
      >
        {"View All"}
      </NavLink>
  </div>
);

export default memo(RecentDSNavBar);
