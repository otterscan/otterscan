import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StandardFrame from "../../components/StandardFrame";
import { useSlot } from "../../useConsensus";
import SlotNotFound from "./SlotNotFound";

const SlotByBlockRoot: React.FC = () => {
  const { blockRoot } = useParams();
  if (blockRoot === undefined) {
    throw new Error("SlotByBlockRoot: blockRoot is undefined");
  }
  const { slot, error, isLoading } = useSlot(blockRoot);
  const navigate = useNavigate();
  useEffect(() => {
    if (slot && slot.data.message.slot) {
      navigate("/slot/" + slot.data.message.slot, {
        replace: true,
      });
    }
  }, [slot]);

  return (
    <StandardFrame>
      {(!slot && !isLoading) || error ? (
        <SlotNotFound slot={blockRoot} />
      ) : (
        <></>
      )}
    </StandardFrame>
  );
};

export default React.memo(SlotByBlockRoot);
