import { FC, useContext, useMemo } from "react";
import StandardTHead from "../../components/StandardTHead";
import {
  useGenericTransactionCount,
  useGenericTransactionList,
} from "../../ots2/usePrototypeTransferHooks";
import { usePageNumber } from "../../ots2/useUIHooks";
import { PAGE_SIZE } from "../../params";
import { findTokenTransfersInLogs } from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";
import { usePageTitle } from "../../useTitle";
import { AddressAwareComponentProps } from "../types";
import ERC20Item, { ERC20ItemProps } from "./ERC20Item";
import GenericTransactionSearchResult from "./GenericTransactionSearchResult";

const tableHeader = (
  <StandardTHead>
    <th className="w-56">Txn Hash</th>
    <th className="w-28">Method</th>
    <th className="w-28">Block</th>
    <th className="w-28">Age</th>
    <th>From</th>
    <th>To</th>
    <th className="w-48">Token</th>
    <th>Value</th>
  </StandardTHead>
);

const AddressERC20Results: FC<AddressAwareComponentProps> = ({ address }) => {
  const { provider } = useContext(RuntimeContext);

  const pageNumber = usePageNumber();
  const total = useGenericTransactionCount(provider, "ERC20Transfer", address);
  const results = useGenericTransactionList(
    provider,
    "ERC20Transfer",
    address,
    pageNumber,
    PAGE_SIZE,
    total,
  );
  const items = useMemo(
    () =>
      results?.results.map(
        (m): ERC20ItemProps => ({
          address,
          blockNumber: m.receipt.blockNumber,
          timestamp:
            results.blocksSummary.get(m.receipt.blockNumber)?.timestamp ?? 0, // TODO: fix get
          hash: m.transaction.hash,
          status: m.receipt.status!,
          data: m.transaction.data,
          from: m.receipt.from,
          to: m.receipt.to,
          value: m.transaction.value,
          type: m.transaction.type,
          tokenTransfers: findTokenTransfersInLogs(m.receipt.logs),
        }),
      ),
    [results],
  );

  usePageTitle("ERC20 Transfers");

  return (
    <GenericTransactionSearchResult
      pageNumber={pageNumber}
      total={total}
      items={items}
      Item={(i) => <ERC20Item {...i} />}
      header={tableHeader}
      columns={8}
    />
  );
};

export default AddressERC20Results;
