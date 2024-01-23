import { FC, memo } from "react";
import BlockLink from "../../components/BlockLink";
import MethodName from "../../components/MethodName";
import NativeTokenAmount from "../../components/NativeTokenAmount";
import TimestampAge from "../../components/TimestampAge";
import TransactionDirection from "../../components/TransactionDirection";
import TransactionLink from "../../components/TransactionLink";
import { TokenTransfer } from "../../types";
import { BlockNumberContext } from "../../useBlockTagContext";
import TransactionAddress from "../components/TransactionAddress";
import { AddressAwareComponentProps } from "../types";
import TokenAmount from "./TokenAmount";

export type ERC20ItemProps = AddressAwareComponentProps & {
  blockNumber: number;
  timestamp: number;
  hash: string;
  status: number;
  data: string;
  from: string | undefined;
  to: string | null;
  value: bigint;
  type: number;
  tokenTransfers: TokenTransfer[];
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
  type,
  tokenTransfers,
}) => {
  return (
    <BlockNumberContext.Provider value={blockNumber}>
      <tr>
        <td>
          <TransactionLink
            txHash={hash}
            fail={status === 0}
            blob={type === 3}
            deposit={type === 126}
          />
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
        <td></td>
        <td>
          <NativeTokenAmount value={value} />
        </td>
      </tr>
      {tokenTransfers &&
        tokenTransfers.map((transfer: TokenTransfer, index: number) =>
          transfer.from === address || transfer.to === address ? (
            <tr key={index}>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <span className="col-span-2 flex items-baseline justify-between space-x-2 pr-2">
                  <span className="truncate">
                    <TransactionAddress
                      address={transfer.from}
                      selectedAddress={address}
                    />
                  </span>
                  <span>
                    <TransactionDirection />
                  </span>
                </span>
              </td>
              <td>
                <TransactionAddress
                  address={transfer.to}
                  selectedAddress={address}
                  showCodeIndicator
                />
              </td>
              <TokenAmount
                tokenAddress={transfer.token}
                amount={transfer.value}
              />
            </tr>
          ) : null,
        )}
    </BlockNumberContext.Provider>
  );
};

export default memo(ERC20Item);
