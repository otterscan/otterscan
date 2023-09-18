import React from "react";
import { FeeDisplay } from "./useFeeToggler";

const DSBlockResultHeader: React.FC = () => (
  <div className="grid grid-cols-12 gap-x-1 border-t border-b border-gray-200 bg-gray-100 px-2 py-2 text-sm font-bold text-gray-500">
    <div>Height</div>
    <div>Difficulty</div>
    <div>DS Difficulty</div>
    <div>Age</div>
    <div className="col-span-4">DS Leader</div>
    <div className="col-span-4">Prev Block Hash</div>
  </div>
);

export default React.memo(DSBlockResultHeader);
