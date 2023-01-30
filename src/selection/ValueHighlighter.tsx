import React from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { useSelectionContext } from "./useSelection";

type ValueHighlighterProps = React.PropsWithChildren<{
  value: BigNumber;
}>;

// TODO: replace all occurences with SelectionHighlighter and remove this component
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
    <span
      className={`border border-dashed rounded hover:bg-transparent hover:border-transparent px-1 truncate ${
        selection !== null &&
        selection.type === "value" &&
        selection.content === value.toString()
          ? "border-orange-400 bg-amber-100"
          : "border-transparent"
      }`}
      onMouseEnter={select}
      onMouseLeave={deselect}
    >
      {children}
    </span>
  );
};

export default React.memo(ValueHighlighter);
