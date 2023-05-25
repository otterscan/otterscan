import { useContext, FC, useMemo } from "react";
import { commify } from "@ethersproject/units";
import { AddressAwareComponentProps } from "../types";
import ContentFrame from "../../components/ContentFrame";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import StandardTable from "../../components/StandardTable";
import StandardTHead from "../../components/StandardTHead";
import StandardTBody from "../../components/StandardTBody";
import PageControl from "../../search/PageControl";
import PendingPage from "./PendingPage";
import ERC20Item, { ERC20ItemProps } from "./ERC20Item";
import { RuntimeContext } from "../../useRuntime";
import {
  useGenericTransactionCount,
  useGenericTransactionList,
} from "../../ots2/usePrototypeTransferHooks";
import { usePageNumber } from "../../ots2/useUIHooks";
import { PAGE_SIZE } from "../../params";

const AddressERC721Results: FC<AddressAwareComponentProps> = ({ address }) => {
  const { provider } = useContext(RuntimeContext);

  const pageNumber = usePageNumber();
  const total = useGenericTransactionCount(provider, "ERC721", address);
  const results = useGenericTransactionList(
    provider,
    "ERC721",
    address,
    pageNumber,
    PAGE_SIZE,
    total
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
        })
      ),
    [results]
  );

  document.title = `ERC721 Transfers | Otterscan`;

  return (
    <ContentFrame key={pageNumber} tabs>
      <div className="flex items-baseline justify-between py-3">
        <div className="text-sm text-gray-500">
          {items === undefined || total === undefined ? (
            <>Waiting for search results...</>
          ) : (
            <>A total of {commify(total)} transactions found</>
          )}
        </div>
        {total !== undefined && (
          <PageControl
            pageNumber={pageNumber}
            pageSize={PAGE_SIZE}
            total={total}
          />
        )}
      </div>
      <StandardTable>
        <StandardTHead>
          <th className="w-56">Txn Hash</th>
          <th className="w-28">Method</th>
          <th className="w-28">Block</th>
          <th className="w-28">Age</th>
          <th>From</th>
          <th>To</th>
          <th className="w-44">Value</th>
        </StandardTHead>
        {items !== undefined ? (
          <StandardSelectionBoundary>
            <StandardTBody>
              {items.map((i) => (
                <ERC20Item key={i.hash} {...i} />
              ))}
            </StandardTBody>
          </StandardSelectionBoundary>
        ) : (
          <PendingPage rows={PAGE_SIZE} cols={7} />
        )}
      </StandardTable>
      {items !== undefined && total !== undefined && (
        <div className="flex items-baseline justify-between py-3">
          <div className="text-sm text-gray-500">
            A total of {commify(total)} transactions found
          </div>
          <PageControl
            pageNumber={pageNumber}
            pageSize={PAGE_SIZE}
            total={total}
          />
        </div>
      )}
    </ContentFrame>
  );
};

export default AddressERC721Results;
