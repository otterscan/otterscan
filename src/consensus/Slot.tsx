import { FC, Suspense } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { Tab } from "@headlessui/react";
import StandardFrame from "../StandardFrame";
import StandardSubtitle from "../StandardSubtitle";
import NavBlock from "./components/NavBlock";
import NavTab from "../components/NavTab";
import AttestationsTabTitle from "./slot/AttestationsTabTitle";
import Overview from "./slot/Overview";
import Attestations from "./slot/Attestations";
import { useHeadSlotNumber } from "../useConsensus";
import { slotURL } from "../url";
import { SelectionContext, useSelection } from "../useSelection";

const Slot: FC = () => {
  const { slotNumber } = useParams();
  if (slotNumber === undefined) {
    throw new Error("slotNumber couldn't be undefined here");
  }
  const slotAsNumber = parseInt(slotNumber);
  const headSlotNumber = useHeadSlotNumber();
  const selectionCtx = useSelection();

  return (
    <StandardFrame>
      <StandardSubtitle>
        <div className="flex space-x-1 items-baseline">
          <span>Slot</span>
          <span className="text-base text-gray-500">#{slotNumber}</span>
          {slotAsNumber && headSlotNumber !== undefined && (
            <NavBlock
              entityNum={slotAsNumber}
              latestEntityNum={headSlotNumber}
              urlBuilder={slotURL}
            />
          )}
        </div>
      </StandardSubtitle>
      <SelectionContext.Provider key={slotAsNumber} value={selectionCtx}>
        <Tab.Group>
          <Tab.List className="flex space-x-2 border-l border-r border-t rounded-t-lg bg-white">
            <NavTab href=".">Overview</NavTab>
            <NavTab href="attestations">
              <AttestationsTabTitle slotNumber={slotAsNumber} />
            </NavTab>
          </Tab.List>
        </Tab.Group>
        <Suspense fallback={null}>
          <Routes>
            <Route index element={<Overview />} />
            <Route path="attestations" element={<Attestations />} />
          </Routes>
        </Suspense>
      </SelectionContext.Provider>
    </StandardFrame>
  );
};

export default Slot;
