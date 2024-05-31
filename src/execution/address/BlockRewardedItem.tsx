import { FC, memo, useContext } from "react";
import BlockLink from "../../components/BlockLink";
import NativeTokenAmount from "../../components/NativeTokenAmount";
import TimestampAge from "../../components/TimestampAge";
import SlotLink from "../../consensus/components/SlotLink";
import ValidatorLink from "../../consensus/components/ValidatorLink";
import { BlockNumberContext } from "../../useBlockTagContext";
import { useSlotHeader } from "../../useConsensus";
import { useBlockData } from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";
import { AddressAwareComponentProps } from "../types";
import PendingItem from "./PendingItem";

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
  const { config, provider } = useContext(RuntimeContext);
  const { data: nextBlock, isLoading: isLoadingBlockData } = useBlockData(
    provider,
    (blockNumber + 1).toString(),
  );
  const { slot, isLoading: isLoadingSlotData } = useSlotHeader(
    nextBlock?.parentBeaconBlockRoot ?? null,
  );

  const proposerIndex = slot?.data?.header?.message?.["proposer_index"];
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
        {config?.beaconAPI !== undefined && (
          <>
            <td>
              {isLoadingBlockData || isLoadingSlotData ? (
                <div className="w-80">
                  <PendingItem />
                </div>
              ) : slot && slot?.data?.header?.message?.slot ? (
                <div>
                  <SlotLink slot={Number(slot?.data?.header?.message?.slot)} />
                </div>
              ) : (
                <span className="text-gray-400">Not available</span>
              )}
            </td>
            <td>
              {isLoadingBlockData || isLoadingSlotData ? (
                <div className="w-80">
                  <PendingItem />
                </div>
              ) : (
                <div>
                  {proposerIndex !== undefined ? (
                    <ValidatorLink validatorIndex={proposerIndex} />
                  ) : (
                    <span className="text-gray-400">Not available</span>
                  )}
                </div>
              )}
            </td>
          </>
        )}
      </tr>
    </BlockNumberContext.Provider>
  );
};

export default memo(BlockRewardedItem);
