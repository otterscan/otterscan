import DSBlockLink from "../components/DSBlockLink";
import TimestampAge from "../components/TimestampAge";
import { DsBlockObj } from '@zilliqa-js/core/dist/types/src/types'
import { commify } from "ethers/lib/utils";
import { zilliqaToOtterscanTimestamp } from "../utils/utils";

type DSBlockItemProps = {
  block: DsBlockObj, 
};

const RecentDSBlockItem: React.FC<DSBlockItemProps> = ({ block }) => {

  return (
    <div
    className="grid grid-cols-4 items-baseline gap-x-1 border-t border-gray-200 text-sm 
    hover:bg-skin-table-hover px-2 py-3"
    >
    <span>
    <DSBlockLink blockTag={block.header.BlockNum} />
    </span>
    <span>
      {commify(block.header.Difficulty)}
    </span>
    <span>
      {commify(block.header.DifficultyDS)}
    </span>
    <TimestampAge timestamp={zilliqaToOtterscanTimestamp(block.header.Timestamp)}/>
    </div>
  );
};

export default RecentDSBlockItem;
