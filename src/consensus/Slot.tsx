import { Tab } from "@headlessui/react";
import { FC, Suspense } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import NavTab from "../components/NavTab";
import StandardFrame from "../components/StandardFrame";
import StandardSelectionBoundary from "../selection/StandardSelectionBoundary";
import Attestations from "./slot/Attestations";
import AttestationsTabTitle from "./slot/AttestationsTabTitle";
import Overview from "./slot/Overview";
import SlotSubtitle from "./slot/SlotSubtitle";

const Slot: FC = () => {
  const { slotNumber } = useParams();
  if (slotNumber === undefined) {
    throw new Error("slotNumber couldn't be undefined here");
  }
  const slotAsNumber = parseInt(slotNumber);

  return (
    <StandardFrame>
      <SlotSubtitle slotNumber={slotAsNumber} />
      <StandardSelectionBoundary>
        <Tab.Group>
          <Tab.List className="flex space-x-2 rounded-t-lg border-l border-r border-t bg-white">
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
      </StandardSelectionBoundary>
    </StandardFrame>
  );
};

export default Slot;
