import React, { useMemo } from "react";
import { useSelectionContext } from "../useSelection";

type AddressHighlighterProps = React.PropsWithChildren<{
  address: string;
}>;

const AddressHighlighter: React.FC<AddressHighlighterProps> = ({
  address,
  children,
}) => {
  const [selection, setSelection] = useSelectionContext();
  const [select, deselect] = useMemo(() => {
    const _select = () => {
      setSelection({ type: "address", content: address });
    };
    const _deselect = () => {
      setSelection(null);
    };
    return [_select, _deselect];
  }, [setSelection, address]);

  return (
    <AddressHighlighterImpl
      selected={
        selection !== null &&
        selection.type === "address" &&
        selection.content === address
      }
      select={select}
      deselect={deselect}
    >
      {children}
    </AddressHighlighterImpl>
  );
};

type _AddressHighlighterImplProps = {
  selected: boolean;
  select: () => void;
  deselect: () => void;
};

const AddressHighlighterImpl: React.FC<_AddressHighlighterImplProps> =
  React.memo(({ selected, select, deselect, children }) => (
    <div
      className={`border border-dashed rounded hover:bg-transparent hover:border-transparent px-1 truncate ${
        selected ? "border-orange-400 bg-yellow-100" : "border-transparent"
      }`}
      onMouseEnter={select}
      onMouseLeave={deselect}
    >
      {children}
    </div>
  ));

export default AddressHighlighter;
