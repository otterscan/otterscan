import React from "react";
import { commify } from "@ethersproject/units";

type FormattedValueProps = {
  value: string;
  unit: string;
};

const FormattedValue: React.FC<FormattedValueProps> = ({ value, unit }) => {
  let parts = value.split(".");
  if (parts.length > 0 && parts[1] === "0") {
    parts = [parts[0]];
  }

  return (
    <div className="text-base">
      {commify(parts[0])}
      {parts.length > 1 ? (
        <span className="text-xs text-gray-500">{`.${parts[1]}`}</span>
      ) : (
        ""
      )}{" "}
      <span className="text-xs text-gray-500">{unit}</span>
    </div>
  );
};

export default FormattedValue;
