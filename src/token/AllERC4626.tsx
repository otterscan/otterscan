import { useContext, FC, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import GenericContractSearchResult from "./GenericContractSearchResult";
import ERC4626Header from "./ERC4626Header";
import ERC4626Item, { ERC4626ItemProps } from "./ERC4626Item";
import { RuntimeContext } from "../useRuntime";
import {
  useGenericContractSearch,
  useGenericContractsCount,
} from "../ots2/usePrototypeHooks";
import { erc4626MatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";

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
      pageSize={PAGE_SIZE}
      total={total}
      page={page}
      Item={(m) => <ERC4626Item {...m} />}
    />
  );
};

export default AllERC4626;
