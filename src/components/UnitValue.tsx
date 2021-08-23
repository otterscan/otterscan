import React from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { formatValue } from "./formatter";

type UnitValueProps = {
  value: BigNumber;
  decimals?: number;
  hideUnit?: boolean;
  unit?: string;
  significantDecDigits?: number;
};

const UnitValue: React.FC<UnitValueProps> = ({
  value,
  decimals = 18,
  hideUnit,
  unit = "Ether",
  significantDecDigits = 4,
}) => {
  const formattedValue = formatValue(value, decimals);
  const parts = formattedValue.split(".");
  const decPart = parts.length > 1 && parts[1];

  return (
    <span
      className={`text-sm ${value.isZero() ? "text-gray-400" : ""}`}
      title={`${formattedValue} ${unit}`}
    >
      <span className="font-balance">
        {parts[0]}
        {decPart && (
          <span className="text-xs">
            .{decPart.substr(0, significantDecDigits)}
            {decPart?.length > significantDecDigits && (
              <span className="text-gray-400">
                {decPart.substr(significantDecDigits)}
              </span>
            )}
          </span>
        )}
      </span>
      {!hideUnit && <span className="text-gray-400"> {unit}</span>}
    </span>
  );
};

export default React.memo(UnitValue);
