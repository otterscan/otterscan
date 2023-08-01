import React from "react";

const PendingBlockResults: React.FC = () => (
  <div className="grid animate-pulse grid-cols-5 items-baseline gap-x-1 border-t border-gray-200 px-2 py-3 text-sm">
    <div className="col-span-1 h-5 w-full rounded bg-gradient-to-r from-gray-100 to-transparent"></div>
    <div className="col-span-1 h-5 w-full rounded bg-gradient-to-r from-gray-100 to-transparent"></div>
    <div className="col-span-1 h-5 w-full rounded bg-gradient-to-r from-gray-100 to-transparent"></div>
    <div className="col-span-1 h-5 w-full rounded bg-gradient-to-r from-gray-100 to-transparent"></div>
    <div className="col-span-1 h-5 w-full rounded bg-gradient-to-r from-gray-100 to-transparent"></div>
  </div>
);

export default React.memo(PendingBlockResults);
