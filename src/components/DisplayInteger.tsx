import { FC } from "react";

type DisplayIntegerProps = {
  numberStr: string;
};

const DisplayInteger: FC<DisplayIntegerProps> = ({ numberStr }) => {
  const parts = [];
  const isNegative = numberStr[0] == "-";
  let n = isNegative ? numberStr.slice(1) : numberStr;
  let groupNum = 0;
  for (var pos = n.length; pos > 0; pos -= 3) {
    const firstGroup = pos - 3 <= 0;
    const part = n.slice(firstGroup ? 0 : pos - 3, pos);
    parts.unshift(
      <span key={pos} className={firstGroup ? "" : "before:content-[',']"}>
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
