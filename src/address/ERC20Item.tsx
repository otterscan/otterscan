import { FC, memo, useContext } from "react";
import TransactionLink from "../components/TransactionLink";
import MethodName from "../components/MethodName";
import BlockLink from "../components/BlockLink";
import TimestampAge from "../components/TimestampAge";
import AddressHighlighter from "../components/AddressHighlighter";
import DecoratedAddressLink from "../components/DecoratedAddressLink";
import TransactionDirection from "../components/TransactionDirection";
import { RuntimeContext } from "../useRuntime";
import {
  TransactionMatch,
  useHasCode,
  useTransactionByHash,
} from "../useErigonHooks";
import { AddressAwareComponentProps } from "../execution/types";
import TransactionValue from "../components/TransactionValue";

type ERC20temProps = AddressAwareComponentProps & {
  m: TransactionMatch;
};

const ERC20Item: FC<ERC20temProps> = ({ address, m: { hash } }) => {
  const { provider } = useContext(RuntimeContext);
  const res = useTransactionByHash(provider, hash);
  const toHasCode = useHasCode(
    provider,
    res?.to ?? undefined,
    res?.blockNumber ? res.blockNumber - 1 : undefined
  );

  return (
    <tr>
      {res ? (
        <>
          <td>
            {/* {tx.status === 0 && (
            <span className="text-red-600" title="Transaction reverted">
              <FontAwesomeIcon icon={faExclamationCircle} />
            </span>
          )} */}
            <span className="truncate">
              <TransactionLink txHash={res.hash} />
            </span>
          </td>
          <td>{res.to !== null && <MethodName data={res.data} />}</td>
          <td>{res.blockNumber && <BlockLink blockTag={res.blockNumber} />}</td>
          <td>{res.timestamp && <TimestampAge timestamp={res.timestamp} />}</td>
          <td>
            <span className="col-span-2 flex items-baseline justify-between space-x-2 pr-2">
              <span className="truncate">
                {res.from && (
                  <AddressHighlighter address={res.from}>
                    <DecoratedAddressLink
                      address={res.from}
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
            {res.to && (
              <AddressHighlighter address={res.to}>
                <DecoratedAddressLink
                  address={res.to}
                  selectedAddress={address}
                  // miner={tx.miner === tx.to}
                  eoa={toHasCode === undefined ? undefined : !toHasCode}
                />
              </AddressHighlighter>
            )}
          </td>
          <td>
            <TransactionValue value={res.value} />
          </td>
        </>
      ) : (
        <>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </>
      )}
    </tr>
  );
};

export default memo(ERC20Item);
