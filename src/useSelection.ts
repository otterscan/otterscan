import React, { useState, useContext } from "react";

export type Selection = {
  type: "address";
  content: string;
};

export const useSelection = (): [
  Selection | null,
  React.Dispatch<React.SetStateAction<Selection | null>>
] => {
  const [selection, setSelection] = useState<Selection | null>(null);
  return [selection, setSelection];
};

export const SelectionContext = React.createContext<
  ReturnType<typeof useSelection>
>(null!);

export const useSelectionContext = () => {
  const ctx = useContext(SelectionContext);
  return ctx;
};
