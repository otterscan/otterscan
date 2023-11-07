import { FC, memo } from "react";
import BlockLink from "../../components/BlockLink";
import MethodName from "../../components/MethodName";
import NativeTokenAmount from "../../components/NativeTokenAmount";
import TimestampAge from "../../components/TimestampAge";
import TransactionDirection from "../../components/TransactionDirection";
import TransactionLink from "../../components/TransactionLink";
import { BlockNumberContext } from "../../useBlockTagContext";
import TransactionAddress from "../components/TransactionAddress";
import { AddressAwareComponentProps } from "../types";

export type ERC20ItemProps = AddressAwareComponentProps & {
  blockNumber: number;
  timestamp: number;
  hash: string;
  status: number;
  data: string;
  from: string | undefined;
  to: string | null;
  value: bigint;
};

const ERC20Item: FC<ERC20ItemProps> = ({
  address,
  blockNumber,
  timestamp,
  hash,
  status,
  data,
  from,
  to,
  value,
}) => {
  return (
    <BlockNumberContext.Provider value={blockNumber}>
      <tr>
        <td>
          <TransactionLink txHash={hash} fail={status === 0} />
        </td>
        <td>{to !== null && <MethodName data={data} to={to} />}</td>
        <td>
          <BlockLink blockTag={blockNumber} />
        </td>
        <td>
          <TimestampAge timestamp={timestamp} />
        </td>
        <td>
          <span className="col-span-2 flex items-baseline justify-between space-x-2 pr-2">
            <span className="truncate">
              {from && (
                <TransactionAddress address={from} selectedAddress={address} />
              )}
            </span>
            <span>
              <TransactionDirection
              // direction={undefined}
              // flags={sendsToMiner ? Flags.MINER : undefined}
              />
            </span>
          </span>
        </td>
        <td>
          {to && (
            <TransactionAddress
              address={to}
              selectedAddress={address}
              showCodeIndicator
            />
          )}
        </td>
        <td>
          <NativeTokenAmount value={value} />
        </td>
      </tr>
    </BlockNumberContext.Provider>
  );
};

export default memo(ERC20Item);
