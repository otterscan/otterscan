import { FC, memo, useContext } from "react";
import BlockLink from "../../components/BlockLink";
import NativeTokenAmount from "../../components/NativeTokenAmount";
import TimestampAge from "../../components/TimestampAge";
import TransactionDirection from "../../components/TransactionDirection";
import ValidatorLink from "../../consensus/components/ValidatorLink";
import { BlockNumberContext } from "../../useBlockTagContext";
import { RuntimeContext } from "../../useRuntime";
import { commify } from "../../utils/utils";
import TransactionAddress from "../components/TransactionAddress";
import { AddressAwareComponentProps } from "../types";

export type WithdrawalItemProps = AddressAwareComponentProps & {
  index: bigint;
  blockNumber: number;
  timestamp: number;
  validatorIndex: number;
  amount: bigint;
};

const WithdrawalItem: FC<WithdrawalItemProps> = ({
  address,
  index,
  blockNumber,
  timestamp,
  validatorIndex,
  amount,
}) => {
  const { config } = useContext(RuntimeContext);
  const hasConsensusClient = config?.beaconAPI !== undefined;
  return (
    <BlockNumberContext.Provider value={blockNumber}>
      <tr>
        <td>{commify(index)}</td>
        <td>
          <BlockLink blockTag={blockNumber} />
        </td>
        <td>
          <TimestampAge timestamp={timestamp} />
        </td>
        <td>
          <span className="col-span-2 flex items-baseline justify-between space-x-2 pr-2">
            <span className="truncate">
              <ValidatorLink
                validatorIndex={validatorIndex}
                disabled={!hasConsensusClient}
              />
            </span>
            <span>
              <TransactionDirection
              // direction={undefined}
              />
            </span>
          </span>
        </td>
        <td>
          <TransactionAddress
            address={address}
            selectedAddress={address}
            showCodeIndicator
          />
        </td>
        <td>
          <NativeTokenAmount value={amount * 1_000_000_000n} />
        </td>
      </tr>
    </BlockNumberContext.Provider>
  );
};

export default memo(WithdrawalItem);
