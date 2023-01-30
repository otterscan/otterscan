import { FC, Suspense } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { Tab } from "@headlessui/react";
import { isHexString } from "@ethersproject/bytes";
import StandardFrame from "../StandardFrame";
import StandardSelectionBoundary from "../components/StandardSelectionBoundary";
import ValidatorSubtitle from "./validator/ValidatorSubtitle";
import NavTab from "../components/NavTab";
import Overview from "./validator/Overview";
import { useValidator } from "../useConsensus";

const Validator: FC = () => {
  const { validatorIndex } = useParams();
  if (validatorIndex === undefined) {
    throw new Error("validatorIndex couldn't be undefined here");
  }
  const idx = parseValidatorIndex(validatorIndex);
  if (idx === undefined) {
    throw new Error("Invalid validator index or public key");
  }

  const validator = useValidator(idx);

  return (
    <StandardFrame>
      {validator && (
        <>
          <ValidatorSubtitle
            validatorIndex={validator.data.index}
            slashed={validator.data.validator.slashed}
          />
          <StandardSelectionBoundary>
            <Tab.Group>
              <Tab.List className="flex space-x-2 border-l border-r border-t rounded-t-lg bg-white">
                <NavTab href=".">Overview</NavTab>
              </Tab.List>
            </Tab.Group>
            <Suspense fallback={null}>
              <Routes>
                <Route
                  index
                  element={<Overview validatorIndex={validator.data.index} />}
                />
              </Routes>
            </Suspense>
          </StandardSelectionBoundary>
        </>
      )}
    </StandardFrame>
  );
};

const parseValidatorIndex = (
  validatorIndex: string
): number | string | undefined => {
  // Validator by index
  if (validatorIndex.match(/^\d+$/)) {
    return parseInt(validatorIndex);
  }

  // Validator by public key
  if (validatorIndex.length === 98 && isHexString(validatorIndex, 48)) {
    return validatorIndex;
  }

  return undefined;
};

export default Validator;
