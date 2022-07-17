import React from "react";

const PendingApprovals: React.FC = () => (
  <div className="animate-pulse grid grid-cols-12 gap-x-1 items-baseline text-sm border-t border-gray-200 px-2 py-3">
    <div className="w-full h-5 rounded bg-gradient-to-r from-gray-100 to-transparent col-span-4"></div>
    <div className="w-full h-5 rounded bg-gradient-to-r from-gray-100 to-transparent col-span-4"></div>
    <div className="w-full h-5 rounded bg-gradient-to-r from-gray-100 to-transparent col-span-3"></div>
    <div className="w-full h-5 rounded bg-gradient-to-r from-gray-100 to-transparent col-span-1"></div>
  </div>
);

export default React.memo(PendingApprovals);
