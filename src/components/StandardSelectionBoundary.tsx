import { FC, PropsWithChildren } from "react";
import { SelectionContext, useSelection } from "../useSelection";

const StandardSelectionBoundary: FC<PropsWithChildren> = ({ children }) => {
  const selectionCtx = useSelection();

  return (
    <SelectionContext.Provider value={selectionCtx}>
      {children}
    </SelectionContext.Provider>
  );
};

export default StandardSelectionBoundary;
