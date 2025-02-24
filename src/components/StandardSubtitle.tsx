import React, { PropsWithChildren } from "react";

const StandardSubtitle: React.FC<PropsWithChildren> = ({ children }) => (
  <div className="pb-2 text-lg sm:text-xl text-gray-700 overflow-x-auto">
    {children}
  </div>
);

export default StandardSubtitle;
