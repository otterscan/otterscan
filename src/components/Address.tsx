import React from "react";

const Address: React.FC = ({ children }) => (
  <span className="font-address text-gray-400 truncate">
    <p className="truncate">{children}</p>
  </span>
);

export default Address;
