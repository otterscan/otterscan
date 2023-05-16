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
import ERC4626Header from "./ERC4626Header";
import ERC4626Item, { ERC4626ItemProps } from "./ERC4626Item";
import { RuntimeContext } from "../useRuntime";
import {
  useGenericContractSearch,
  useGenericContractsCount,
} from "../ots2/usePrototypeHooks";
import { erc4626MatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";
import GenericContractSearchResult from "./GenericContractSearchResult";

const AllERC4626: FC = () => {
  const { provider } = useContext(RuntimeContext);

  const [searchParams] = useSearchParams();
  let pageNumber = 1;
  const p = searchParams.get("p");
  if (p) {
    try {
      pageNumber = parseInt(p);
    } catch (err) {}
  }

  const total = useGenericContractsCount(provider, "ERC4626");
  const results = useGenericContractSearch(
    provider,
    "ERC4626",
    pageNumber,
    PAGE_SIZE,
    total,
    erc4626MatchParser
  );
  const page: ERC4626ItemProps[] | undefined = useMemo(() => {
    return results?.results
      .map(
        (m): ERC4626ItemProps => ({
          blockNumber: m.blockNumber,
          timestamp: results!.blocksSummary.get(m.blockNumber)!.timestamp,
          address: m.address,
          name: m.name,
          symbol: m.symbol,
          decimals: m.decimals,
          asset: m.asset,
          totalAssets: m.totalAssets,
        })
      )
      .reverse();
  }, [results]);

  document.title = `ERC4626 Tokens | Otterscan`;

  return (
    <GenericContractSearchResult
      title="ERC4626 tokens"
      header={<ERC4626Header />}
      pageNumber={pageNumber}
      total={total}
      page={page}
      item={(m) => <ERC4626Item {...m} />}
    />
    // <StandardFrame>
    //   <StandardSubtitle>
    //     <div className="flex items-baseline space-x-1">
    //       <span>ERC4626 tokens</span>
    //     </div>
    //   </StandardSubtitle>
    //   <ContentFrame key={pageNumber}>
    //     <div className="flex items-baseline justify-between py-3">
    //       <div className="text-sm text-gray-500">
    //         {page === undefined || total === undefined ? (
    //           <>Waiting for search results...</>
    //         ) : (
    //           <>A total of {commify(total)} contracts found</>
    //         )}
    //       </div>
    //       {total !== undefined && (
    //         <PageControl
    //           pageNumber={pageNumber}
    //           pageSize={PAGE_SIZE}
    //           total={total}
    //         />
    //       )}
    //     </div>
    //     <StandardScrollableTable>
    //       <StandardTHead>
    //         <ERC4626Header />
    //       </StandardTHead>
    //       {page !== undefined ? (
    //         <StandardSelectionBoundary>
    //           <StandardTBody>
    //             {page.map((m) => (
    //               <ERC4626Item key={m.address} {...m} />
    //             ))}
    //           </StandardTBody>
    //         </StandardSelectionBoundary>
    //       ) : (
    //         // <PendingResults />
    //         <></>
    //       )}
    //     </StandardScrollableTable>
    //     {page !== undefined && total !== undefined && (
    //       <div className="flex items-baseline justify-between py-3">
    //         <div className="text-sm text-gray-500">
    //           A total of {commify(total)} contracts found
    //         </div>
    //         <PageControl
    //           pageNumber={pageNumber}
    //           pageSize={PAGE_SIZE}
    //           total={total}
    //         />
    //       </div>
    //     )}
    //   </ContentFrame>
    // </StandardFrame>
  );
};

export default AllERC4626;
