import React from "react";

const PendingResults: React.FC = () => (
  <div className="grid animate-pulse grid-cols-12 items-baseline gap-x-1 border-t border-gray-200 px-2 py-3 text-sm">
    <div className="col-span-2 h-5 w-full rounded-sm bg-linear-to-r from-gray-100 to-transparent"></div>
    <div className="col-span-1 h-5 w-full rounded-sm bg-linear-to-r from-gray-100 to-transparent"></div>
    <div className="col-span-1 h-5 w-full rounded-sm bg-linear-to-r from-gray-100 to-transparent"></div>
    <div className="col-span-1 h-5 w-full rounded-sm bg-linear-to-r from-gray-100 to-transparent"></div>
    <div className="col-span-2 h-5 w-full rounded-sm bg-linear-to-r from-gray-100 to-transparent"></div>
    <div className="col-span-2 h-5 w-full rounded-sm bg-linear-to-r from-gray-100 to-transparent"></div>
    <div className="col-span-2 h-5 w-full rounded-sm bg-linear-to-r from-gray-100 to-transparent"></div>
    <div className="col-span-1 h-5 w-full rounded-sm bg-linear-to-r from-gray-100 to-transparent"></div>
  </div>
);

export default React.memo(PendingResults);
