import React from "react";

type BytesDecoderProps = {
  r: any;
};

const BytesDecoder: React.FC<BytesDecoderProps> = ({ r }) => (
  <span>
    {r.toString()}{" "}
    <span className="font-sans text-xs text-gray-400">
      {r.toString().length / 2 - 1}{" "}
      {r.toString().length / 2 - 1 === 1 ? "byte" : "bytes"}
    </span>
  </span>
);

export default React.memo(BytesDecoder);
