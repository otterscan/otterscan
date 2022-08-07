import React, { PropsWithChildren, useMemo } from "react";
import {
  useSelectionContext,
  OptionalSelection,
  SelectionType,
} from "../useSelection";

export type ContentSelector = (
  selection: OptionalSelection,
  content: string
) => boolean;

export const genericSelector =
  (type: SelectionType) =>
  (selection: OptionalSelection, content: string): boolean =>
    selection !== null &&
    selection.type === type &&
    selection.content === content;

export const addressSelector: ContentSelector = genericSelector("address");
export const valueSelector: ContentSelector = genericSelector("value");
export const functionSigSelector: ContentSelector =
  genericSelector("functionSig");

type SelectionHighlighterProps = React.PropsWithChildren<{
  myType: SelectionType;
  myContent: string;
  selector: ContentSelector;
}>;

const SelectionHighlighter: React.FC<SelectionHighlighterProps> = ({
  myType,
  myContent,
  selector,
  children,
}) => {
  const [selection, setSelection] = useSelectionContext();
  const [select, deselect] = useMemo(() => {
    const _select = () => {
      setSelection({ type: myType, content: myContent });
    };
    const _deselect = () => {
      setSelection(null);
    };
    return [_select, _deselect];
  }, [setSelection, myType, myContent]);

  return (
    <HighlighterBox
      selected={selector(selection, myContent)}
      select={select}
      deselect={deselect}
    >
      {children}
    </HighlighterBox>
  );
};

type HighlighterBoxProps = {
  selected: boolean;
  select: () => void;
  deselect: () => void;
};

const HighlighterBox: React.FC<PropsWithChildren<HighlighterBoxProps>> =
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

export default SelectionHighlighter;
