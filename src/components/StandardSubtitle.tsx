import React, { PropsWithChildren } from "react";

const StandardSubtitle: React.FC<PropsWithChildren> = ({ children }) => (
  <div className="pb-2 text-xl text-gray-700">{children}</div>
);

export default StandardSubtitle;
