import React from "react";

type BooleanDecoderProps = {
  r: any;
};

const BooleanDecoder: React.FC<BooleanDecoderProps> = ({ r }) => (
  <span className={`${r ? "text-emerald-700" : "text-red-700"}`}>
    {r.toString()}
  </span>
);

export default React.memo(BooleanDecoder);
