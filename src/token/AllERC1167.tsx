import { useContext, FC, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import GenericContractSearchResult from "./GenericContractSearchResult";
import ERC1167Header from "./ERC1167Header";
import ERC1167Item, { ERC1167ItemProps } from "./ERC1167Item";
import { RuntimeContext } from "../useRuntime";
import {
  useGenericContractSearch,
  useGenericContractsCount,
} from "../ots2/usePrototypeHooks";
import { erc1167MatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";

const AllERC1167: FC = () => {
  const { provider } = useContext(RuntimeContext);

  const [searchParams] = useSearchParams();
  let pageNumber = 1;
  const p = searchParams.get("p");
  if (p) {
    try {
      pageNumber = parseInt(p);
    } catch (err) {}
  }

  const total = useGenericContractsCount(provider, "ERC1167");
  const results = useGenericContractSearch(
    provider,
    "ERC1167",
    pageNumber,
    PAGE_SIZE,
    total,
    erc1167MatchParser
  );
  const page: ERC1167ItemProps[] | undefined = useMemo(() => {
    return results?.results
      .map(
        (m): ERC1167ItemProps => ({
          blockNumber: m.blockNumber,
          timestamp: results!.blocksSummary.get(m.blockNumber)!.timestamp,
          address: m.address,
          implementation: m.implementation,
        })
      )
      .reverse();
  }, [results]);

  document.title = `ERC1167 Contracts | Otterscan`;

  return (
    <GenericContractSearchResult
      title="ERC1167 contracts"
      header={<ERC1167Header />}
      pageNumber={pageNumber}
      pageSize={PAGE_SIZE}
      total={total}
      page={page}
      Item={(m) => <ERC1167Item {...m} />}
    />
  );
};

export default AllERC1167;
