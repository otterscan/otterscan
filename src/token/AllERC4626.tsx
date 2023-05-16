import { FC, useMemo } from "react";
import GenericContractSearchResult from "./GenericContractSearchResult";
import ERC4626Header from "./ERC4626Header";
import ERC4626Item, { ERC4626ItemProps } from "./ERC4626Item";
import { useContractSearch } from "../ots2/useUIHooks";
import { erc4626MatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";

const AllERC4626: FC = () => {
  const { pageNumber, results, total } = useContractSearch(
    "ERC4626",
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
