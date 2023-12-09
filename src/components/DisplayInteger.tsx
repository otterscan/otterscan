import { FC } from "react";

type DisplayIntegerProps = {
  numberStr: string;
  // If true, displays a shadow around the comma before 18 digits
  decimalHint: boolean;
};

const DisplayInteger: FC<DisplayIntegerProps> = ({
  numberStr,
  decimalHint = false,
}) => {
  const parts = [];
  const isNegative = numberStr[0] == "-";
  let n = isNegative ? numberStr.slice(1) : numberStr;
  let groupNum = 0;
  for (var pos = n.length; pos > 0; pos -= 3) {
    const firstGroup = pos - 3 <= 0;
    const part = n.slice(firstGroup ? 0 : pos - 3, pos);
    parts.unshift(
      <span
        key={pos}
        className={`${
          groupNum === 5 && decimalHint
            ? "before:drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] "
            : ""
        }${firstGroup ? "" : "before:content-[',']"}`}
      >
        {part}
      </span>,
    );
    groupNum += 1;
  }
  return (
    <>
      {isNegative ? "-" : ""}
      {parts}
    </>
  );
};

export default DisplayInteger;
