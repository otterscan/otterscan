import { FC, memo } from "react";
import TransactionLink from "../../components/TransactionLink";
import MethodName from "../../components/MethodName";
import BlockLink from "../../components/BlockLink";
import TimestampAge from "../../components/TimestampAge";
import TransactionDirection from "../../components/TransactionDirection";
import { AddressAwareComponentProps } from "../types";
import TransactionValue from "../../components/TransactionValue";
import { ProcessedTransaction } from "../../types";
import TransactionAddress from "../components/TransactionAddress";
import { BlockNumberContext } from "../../useBlockTagContext";

type ERC20temProps = AddressAwareComponentProps & {
  p: ProcessedTransaction;
};

const ERC20Item: FC<ERC20temProps> = ({ address, p }) => {
  return (
    <BlockNumberContext.Provider value={p.blockNumber}>
      <tr>
        <td>
          <TransactionLink txHash={p.hash} fail={p.status === 0} />
        </td>
        <td>{p.to !== null && <MethodName data={p.data} />}</td>
        <td>
          <BlockLink blockTag={p.blockNumber} />
        </td>
        <td>
          <TimestampAge timestamp={p.timestamp} />
        </td>
        <td>
          <span className="col-span-2 flex items-baseline justify-between space-x-2 pr-2">
            <span className="truncate">
              {p.from && (
                <TransactionAddress
                  address={p.from}
                  selectedAddress={address}
                />
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
          {p.to && (
            <TransactionAddress
              address={p.to}
              selectedAddress={address}
              showCodeIndicator
            />
          )}
        </td>
        <td>
          <TransactionValue value={p.value} />
        </td>
      </tr>
    </BlockNumberContext.Provider>
  );
};

export default memo(ERC20Item);
