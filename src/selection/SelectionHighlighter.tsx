import { FC, memo, PropsWithChildren, useMemo } from "react";
import {
  OptionalSelection,
  SelectionType,
  useSelectionContext,
} from "./useSelection";

export type ContentSelector = (
  selection: OptionalSelection,
  content: string,
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
export const tagSelector: ContentSelector = genericSelector("tag");

type SelectionHighlighterProps = {
  myType: SelectionType;
  myContent: string;
  selector: ContentSelector;
};

const SelectionHighlighter: FC<
  PropsWithChildren<SelectionHighlighterProps>
> = ({ myType, myContent, selector, children }) => {
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

const HighlighterBox: FC<PropsWithChildren<HighlighterBoxProps>> = memo(
  ({ selected, select, deselect, children }) => (
    <div
      className={`truncate rounded border border-dashed px-1 hover:border-transparent hover:bg-transparent ${
        selected ? "border-orange-400 bg-amber-100" : "border-transparent"
      }`}
      onMouseEnter={select}
      onMouseLeave={deselect}
    >
      {children}
    </div>
  ),
);

export default SelectionHighlighter;
