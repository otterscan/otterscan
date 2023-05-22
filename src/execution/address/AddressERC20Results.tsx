import { useContext, FC } from "react";
import { commify } from "@ethersproject/units";
import { AddressAwareComponentProps } from "../types";
import ContentFrame from "../../components/ContentFrame";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import StandardTable from "../../components/StandardTable";
import StandardTHead from "../../components/StandardTHead";
import StandardTBody from "../../components/StandardTBody";
import PageControl from "../../search/PageControl";
import ERC20Item from "./ERC20Item";
import { RuntimeContext } from "../../useRuntime";
import {
  useGenericTransactionCount,
  useGenericTransactionList,
  useTransactionsWithReceipts,
} from "../../ots2/usePrototypeTransferHooks";
import { usePageNumber } from "../../ots2/useUIHooks";
import { PAGE_SIZE } from "../../params";

const AddressERC20Results: FC<AddressAwareComponentProps> = ({ address }) => {
  const { provider } = useContext(RuntimeContext);

  const pageNumber = usePageNumber();
  const total = useGenericTransactionCount(provider, "ERC20", address);
  const page = useGenericTransactionList(
    provider,
    "ERC20",
    address,
    pageNumber,
    PAGE_SIZE
  );
  const matches = useTransactionsWithReceipts(
    provider,
    page?.map((p) => p.hash)
  );

  document.title = `ERC20 Transfers | Otterscan`;

  return (
    <ContentFrame key={pageNumber} tabs>
      <div className="flex items-baseline justify-between py-3">
        <div className="text-sm text-gray-500">
          {page === undefined || total === undefined ? (
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
        {matches !== undefined ? (
          <StandardSelectionBoundary>
            <StandardTBody>
              {matches.map((m) => (
                <ERC20Item key={m.hash} address={address} p={m} />
              ))}
            </StandardTBody>
          </StandardSelectionBoundary>
        ) : (
          // <PendingResults />
          <></>
        )}
      </StandardTable>
      {page !== undefined && total !== undefined && (
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

export default AddressERC20Results;
