import React from "react";

type HexValueProps = {
  value: string;
};

const HexValue: React.FC<HexValueProps> = ({ value }) => {
  const shards: string[] = [value.slice(0, 10)];
  for (let i = 10; i < value.length; i += 8) {
    shards.push(value.slice(i, i + 8));
  }

  return (
    <>
      {shards.map((s, i) => (
        <span
          className={`font-hash ${
            i % 2 === 0 ? "text-black" : "text-gray-400"
          }`}
        >
          {s}
        </span>
      ))}
    </>
  );
};

export default React.memo(HexValue);
