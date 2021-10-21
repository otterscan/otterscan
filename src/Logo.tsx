import React from "react";
import Otter from "./otter.jpg";

const Logo: React.FC = () => (
  <div className="mx-auto mb-16 text-6xl text-link-blue font-title font-bold cursor-default flex items-center space-x-4">
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
