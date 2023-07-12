import { FC } from "react";
import { commify } from "@ethersproject/units";
import { useInView } from "react-intersection-observer";
import InfoRow from "../../components/InfoRow";
import HexValue from "../../components/HexValue";
import AggregationBits from "./AggregationBits";
import ValidatorList from "./ValidatorList";
import EpochLink from "../components/EpochLink";

type AttestationProps = {
  idx: number;
  att: any;
};

const Attestation: FC<AttestationProps> = ({ idx, att }) => {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <div className="flex space-x-10 py-5" ref={ref}>
      <div>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          {idx}
        </span>
      </div>
      <div className="w-full divide-y bg-white px-3">
        <InfoRow title="Slot">{commify(att.data.slot.toString())}</InfoRow>
        <InfoRow title="Committee Index">
          {commify(att.data.index.toString())}
        </InfoRow>
        {inView && (
          <>
            <InfoRow title="Aggregation Bits">
              <AggregationBits hex={att.aggregation_bits} />
            </InfoRow>
            <InfoRow title="Validators">
              <ValidatorList
                slotNumber={att.data.slot}
                committeeIndex={att.data.index}
              />
            </InfoRow>
          </>
        )}
        <InfoRow title="Beacon Block Root">
          <HexValue value={att.data.beacon_block_root} />
        </InfoRow>
        <InfoRow title="Source">
          <div className="flex space-x-2">
            <EpochLink epochNumber={att.data.source.epoch} />
            <span>/</span>
            <HexValue value={att.data.source.root} />
          </div>
        </InfoRow>
        <InfoRow title="Target">
          <div className="flex space-x-2">
            <EpochLink epochNumber={att.data.target.epoch} />
            <span>/</span>
            <HexValue value={att.data.target.root} />
          </div>
        </InfoRow>
        <InfoRow title="Signature">
          <HexValue value={att.signature} />
        </InfoRow>
      </div>
    </div>
  );
};

export default Attestation;
