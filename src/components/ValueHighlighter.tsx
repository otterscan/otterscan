import React from "react";
import { BigNumber } from "ethers";
import { useSelectionContext } from "../useSelection";

type ValueHighlighterProps = React.PropsWithChildren<{
  value: BigNumber;
}>;

const ValueHighlighter: React.FC<ValueHighlighterProps> = ({
  value,
  children,
}) => {
  const [selection, setSelection] = useSelectionContext();
  const select = () => {
    setSelection({ type: "value", content: value.toString() });
  };
  const deselect = () => {
    setSelection(null);
  };

  return (
    <div
      className={`border border-dashed rounded hover:bg-transparent hover:border-transparent px-1 truncate ${
        selection !== null &&
        selection.type === "value" &&
        selection.content === value.toString()
          ? "border-orange-400 bg-yellow-100"
          : "border-transparent"
      }`}
      onMouseEnter={select}
      onMouseLeave={deselect}
    >
      {children}
    </div>
  );
};

export default React.memo(ValueHighlighter);
