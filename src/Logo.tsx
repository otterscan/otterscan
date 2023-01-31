import React from "react";
import Otter from "./otter.png";

const Logo: React.FC = () => (
  <div className="flex cursor-default items-center justify-center space-x-4 font-title text-6xl font-bold text-link-blue">
    <img
      className="rounded-full"
      src={Otter}
      width={96}
      height={96}
      alt="An otter scanning"
      title="An otter scanning"
    />
    <span>Otterscan</span>
  </div>
);

export default React.memo(Logo);
