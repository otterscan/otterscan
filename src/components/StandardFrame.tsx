import React, { PropsWithChildren } from "react";

const StandardFrame: React.FC<PropsWithChildren> = ({ children }) => (
  <div className="grow bg-gray-100 px-4 md:px-9 pb-12 pt-3">{children}</div>
);

export default StandardFrame;
