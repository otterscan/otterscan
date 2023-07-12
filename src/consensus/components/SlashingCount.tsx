import { FC, memo } from "react";
import RelevantNumericValue from "../../components/RelevantNumericValue";

type SlashingCountProps = {
  slot: any;
};

const SlashingCount: FC<SlashingCountProps> = ({ slot }) => (
  <>
    <span className="text-gray-400">
      <span className="text-red-600">
        <RelevantNumericValue
          value={slot.data.message.body.attester_slashings.length}
        />
      </span>{" "}
      /{" "}
      <span className="text-red-600">
        <RelevantNumericValue
          value={slot.data.message.body.proposer_slashings.length}
        />
      </span>
    </span>
  </>
);

export default memo(SlashingCount);
