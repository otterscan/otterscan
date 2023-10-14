import { FC, memo } from "react";
import BlockLink from "../../components/BlockLink";
import TimestampAge from "../../components/TimestampAge";
import { AddressAwareComponentProps } from "../types";
import { BlockNumberContext } from "../../useBlockTagContext";
import { commify } from "../../utils/utils";

export type BlockRewardedItemProps = AddressAwareComponentProps & {
  blockNumber: number;
  timestamp: number;
};

const BlockRewardedItem: FC<BlockRewardedItemProps> = ({
  address,
  blockNumber,
  timestamp,
}) => {
  return (
    <BlockNumberContext.Provider value={blockNumber}>
      <tr>
        <td>
          <BlockLink blockTag={blockNumber} />
        </td>
        <td>
          <TimestampAge timestamp={timestamp} />
        </td>
      </tr>
    </BlockNumberContext.Provider>
  );
};

export default memo(BlockRewardedItem);
