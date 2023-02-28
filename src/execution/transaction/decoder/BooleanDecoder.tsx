import { FC, memo } from "react";

type BooleanDecoderProps = {
  r: any;
};

const BooleanDecoder: FC<BooleanDecoderProps> = ({ r }) => (
  <span className={`font-code ${r ? "text-emerald-700" : "text-red-700"}`}>
    {r.toString()}
  </span>
);

export default memo(BooleanDecoder);
