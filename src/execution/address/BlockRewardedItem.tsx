import { FC, memo } from "react";
import BlockLink from "../../components/BlockLink";
import NativeTokenAmount from "../../components/NativeTokenAmount";
import TimestampAge from "../../components/TimestampAge";
import { BlockNumberContext } from "../../useBlockTagContext";
import { AddressAwareComponentProps } from "../types";

export type BlockRewardedItemProps = AddressAwareComponentProps & {
  blockNumber: number;
  timestamp: number;
  totalFees: bigint;
};

const BlockRewardedItem: FC<BlockRewardedItemProps> = ({
  address,
  blockNumber,
  timestamp,
  totalFees,
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
        <td>
          <NativeTokenAmount value={totalFees} />
        </td>
      </tr>
    </BlockNumberContext.Provider>
  );
};

export default memo(BlockRewardedItem);
