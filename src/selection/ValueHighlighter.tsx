import { FC, memo, PropsWithChildren } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { useSelectionContext } from "./useSelection";

type ValueHighlighterProps = {
  value: BigNumber;
};

// TODO: replace all occurences with SelectionHighlighter and remove this component
const ValueHighlighter: FC<PropsWithChildren<ValueHighlighterProps>> = ({
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
      className={`truncate rounded border border-dashed px-1 hover:border-transparent hover:bg-transparent ${
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

export default memo(ValueHighlighter);
