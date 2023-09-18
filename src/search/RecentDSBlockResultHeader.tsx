import React from "react";

const RecentDSBlockResultHeader: React.FC = () => (
  <div className="grid grid-cols-4 gap-x-1 border-t border-b border-gray-200 bg-gray-100 px-2 py-2 text-sm font-bold text-gray-500">
    <div>Height</div>
    <div>Difficulty</div>
    <div>Difficulty</div>
    <div>Age</div>
  </div>
);

export default React.memo(RecentDSBlockResultHeader);
