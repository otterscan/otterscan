import {
  Dispatch,
  SetStateAction,
  createContext,
  useState,
  useContext,
} from "react";

export type Selection = {
  type: "address" | "value";
  content: string;
};

type OptionalSelection = Selection | null;

export const useSelection = (): [
  OptionalSelection,
  Dispatch<SetStateAction<OptionalSelection>>
] => {
  return useState<OptionalSelection>(null);
};

export const SelectionContext = createContext<ReturnType<typeof useSelection>>(
  null!
);

export const useSelectionContext = () => {
  return useContext(SelectionContext);
};
