import React from "react";
import { useSelectionContext } from "../useSelection";

type AddressHighlighterProps = {
  address: string;
};

const AddressHighlighter: React.FC<AddressHighlighterProps> = ({
  address,
  children,
}) => {
  const [selection, setSelection] = useSelectionContext();
  const select = () => {
    setSelection({ type: "address", content: address });
  };
  const deselect = () => {
    setSelection(null);
  };

  return (
    <div
      className={`border border-dashed rounded hover:bg-transparent hover:border-transparent px-1 truncate ${
        selection !== null &&
        selection.type === "address" &&
        selection.content === address
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

export default AddressHighlighter;
