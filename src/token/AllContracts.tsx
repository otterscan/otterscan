import { useContext, FC, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { commify } from "@ethersproject/units";
import StandardFrame from "../components/StandardFrame";
import StandardSubtitle from "../components/StandardSubtitle";
import ContentFrame from "../components/ContentFrame";
import StandardSelectionBoundary from "../selection/StandardSelectionBoundary";
import StandardScrollableTable from "../components/StandardScrollableTable";
import StandardTHead from "../components/StandardTHead";
import StandardTBody from "../components/StandardTBody";
import PageControl from "../search/PageControl";
import ContractItem, { ContractItemProps } from "./ContractItem";
import { RuntimeContext } from "../useRuntime";
import {
  contractMatchParser,
  useGenericContractSearch,
  useGenericContractsCount,
} from "../ots2/usePrototypeHooks";
import { PAGE_SIZE } from "../params";

const AllContracts: FC = () => {
  const { provider } = useContext(RuntimeContext);

  const [searchParams] = useSearchParams();
  let pageNumber = 1;
  const p = searchParams.get("p");
  if (p) {
    try {
      pageNumber = parseInt(p);
    } catch (err) {}
  }

  const total = useGenericContractsCount(provider, "AllContracts");
  const results = useGenericContractSearch(
    provider,
    "AllContracts",
    pageNumber,
    PAGE_SIZE,
    total,
    contractMatchParser
  );
  const page: ContractItemProps[] | undefined = useMemo(() => {
    return results?.results
      .map(
        (m): ContractItemProps => ({
          blockNumber: m.blockNumber,
          timestamp: results!.blocksSummary.get(m.blockNumber)!.timestamp,
          address: m.address,
        })
      )
      .reverse();
  }, [results]);

  document.title = `All contracts | Otterscan`;

  return (
    <StandardFrame>
      <StandardSubtitle>
        <div className="flex items-baseline space-x-1">
          <span>Contracts</span>
        </div>
      </StandardSubtitle>
      <ContentFrame key={pageNumber}>
        <div className="flex items-baseline justify-between py-3">
          <div className="text-sm text-gray-500">
            {page === undefined || total === undefined ? (
              <>Waiting for search results...</>
            ) : (
              <>A total of {commify(total)} contracts found</>
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
        <StandardScrollableTable>
          <StandardTHead>
            <th className="w-96">Address</th>
            <th className="w-28">Block</th>
            <th>Age</th>
          </StandardTHead>
          {page !== undefined ? (
            <StandardSelectionBoundary>
              <StandardTBody>
                {page.map((m) => (
                  <ContractItem key={m.address} {...m} />
                ))}
              </StandardTBody>
            </StandardSelectionBoundary>
          ) : (
            // <PendingResults />
            <></>
          )}
        </StandardScrollableTable>
        {page !== undefined && total !== undefined && (
          <div className="flex items-baseline justify-between py-3">
            <div className="text-sm text-gray-500">
              A total of {commify(total)} contracts found
            </div>
            <PageControl
              pageNumber={pageNumber}
              pageSize={PAGE_SIZE}
              total={total}
            />
          </div>
        )}
      </ContentFrame>
    </StandardFrame>
  );
};

export default AllContracts;
