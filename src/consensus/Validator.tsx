import { FC, Suspense } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { Tab } from "@headlessui/react";
import StandardFrame from "../StandardFrame";
import StandardSubtitle from "../StandardSubtitle";
import NavTab from "../components/NavTab";
import Overview from "./validator/Overview";
import { useValidator } from "../useConsensus";
import { SelectionContext, useSelection } from "../useSelection";

const Validator: FC = () => {
  const { validatorIndex } = useParams();
  if (validatorIndex === undefined) {
    throw new Error("validatorIndex couldn't be undefined here");
  }
  const validator = useValidator(parseInt(validatorIndex));
  const selectionCtx = useSelection();

  return (
    <StandardFrame>
      <StandardSubtitle>
        <div className="flex space-x-1 items-baseline">
          <span>Validator</span>
          <span className="text-base text-gray-500">#{validatorIndex}</span>
        </div>
      </StandardSubtitle>
      {validator && (
        <SelectionContext.Provider value={selectionCtx}>
          <Tab.Group>
            <Tab.List className="flex space-x-2 border-l border-r border-t rounded-t-lg bg-white">
              <NavTab href=".">Overview</NavTab>
            </Tab.List>
          </Tab.Group>
          <Suspense fallback={null}>
            <Routes>
              <Route index element={<Overview />} />
            </Routes>
          </Suspense>
        </SelectionContext.Provider>
      )}
    </StandardFrame>
  );
};

export default Validator;
