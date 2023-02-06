import { FC, memo, useContext } from "react";
import TransactionLink from "../components/TransactionLink";
import MethodName from "../components/MethodName";
import BlockLink from "../components/BlockLink";
import TimestampAge from "../components/TimestampAge";
import AddressHighlighter from "../components/AddressHighlighter";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import TransactionDirection from "../components/TransactionDirection";
import { RuntimeContext } from "../useRuntime";
import { useHasCode } from "../useErigonHooks";
import { AddressAwareComponentProps } from "../execution/types";
import TransactionValue from "../components/TransactionValue";
import { ProcessedTransaction } from "../types";

type ERC20temProps = AddressAwareComponentProps & {
  p: ProcessedTransaction;
};

const ERC20Item: FC<ERC20temProps> = ({ address, p }) => {
  const { provider } = useContext(RuntimeContext);
  const toHasCode = useHasCode(provider, p.to ?? undefined, p.blockNumber - 1);

  return (
    <tr>
      <>
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
                <AddressHighlighter address={p.from}>
                  <DecoratedAddressLink
                    address={p.from}
                    selectedAddress={address}
                    // miner={res.miner === res.from}
                  />
                </AddressHighlighter>
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
            <AddressHighlighter address={p.to}>
              <DecoratedAddressLink
                address={p.to}
                selectedAddress={address}
                // miner={tx.miner === tx.to}
                eoa={toHasCode === undefined ? undefined : !toHasCode}
              />
            </AddressHighlighter>
          )}
        </td>
        <td>
          <TransactionValue value={p.value} />
        </td>
      </>
    </tr>
  );
};

export default memo(ERC20Item);
