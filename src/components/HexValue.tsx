import React from "react";

type HexValueProps = {
  value: string;
};

const HexValue: React.FC<HexValueProps> = ({ value }) => (
  <span className="font-hash text-black break-all">{value}</span>
);

export default HexValue;
