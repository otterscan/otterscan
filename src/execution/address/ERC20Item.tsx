import { FC, memo } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import TransactionLink from "../../components/TransactionLink";
import MethodName from "../../components/MethodName";
import BlockLink from "../../components/BlockLink";
import TimestampAge from "../../components/TimestampAge";
import TransactionDirection from "../../components/TransactionDirection";
import { AddressAwareComponentProps } from "../types";
import TransactionValue from "../../components/TransactionValue";
import TransactionAddress from "../components/TransactionAddress";
import { BlockNumberContext } from "../../useBlockTagContext";

export type ERC20ItemProps = AddressAwareComponentProps & {
  blockNumber: number;
  timestamp: number;
  hash: string;
  status: number;
  data: string;
  from: string | undefined;
  to: string | null;
  value: BigNumber;
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
        <td>{to !== null && <MethodName data={data} />}</td>
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
          <TransactionValue value={value} />
        </td>
      </tr>
    </BlockNumberContext.Provider>
  );
};

export default memo(ERC20Item);
