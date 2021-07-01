import React from "react";
import UndefinedPageButton from "./UndefinedPageButton";

type UndefinedPageControlProps = {
  isFirst?: boolean;
  isLast?: boolean;
  address: string;
  prevHash: string;
  nextHash: string;
  disabled?: boolean;
};

const UndefinedPageControl: React.FC<UndefinedPageControlProps> = ({
  isFirst,
  isLast,
  address,
  prevHash,
  nextHash,
  disabled,
}) => {
  return (
    <div className="flex items-baseline space-x-1 text-xs">
      <UndefinedPageButton
        address={address}
        direction="first"
        disabled={disabled || isFirst}
      >
        First
      </UndefinedPageButton>
      <UndefinedPageButton
        address={address}
        direction="prev"
        hash={prevHash}
        disabled={disabled || isFirst}
      >
        {"<"}
      </UndefinedPageButton>
      <UndefinedPageButton
        address={address}
        direction="next"
        hash={nextHash}
        disabled={disabled || isLast}
      >
        {">"}
      </UndefinedPageButton>
      <UndefinedPageButton
        address={address}
        direction="last"
        disabled={disabled || isLast}
      >
        Last
      </UndefinedPageButton>
    </div>
  );
};

export default React.memo(UndefinedPageControl);
