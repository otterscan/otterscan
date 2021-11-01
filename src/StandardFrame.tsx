import React from "react";

const StandardFrame: React.FC = ({ children }) => (
  <div className="flex-grow bg-gray-100 px-9 pt-3 pb-12">{children}</div>
);

export default StandardFrame;
