import {
  Dispatch,
  SetStateAction,
  createContext,
  useState,
  useContext,
} from "react";

export type SelectionType = "address" | "value" | "functionSig" | "tag";

export type Selection = {
  type: SelectionType;
  content: string;
};

export type OptionalSelection = Selection | null;

export const useSelection = (): [
  OptionalSelection,
  Dispatch<SetStateAction<OptionalSelection>>,
] => {
  return useState<OptionalSelection>(null);
};

export const SelectionContext = createContext<ReturnType<typeof useSelection>>(
  null!,
);

export const useSelectionContext = () => {
  return useContext(SelectionContext);
};
