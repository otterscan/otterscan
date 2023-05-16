import { FC, useMemo } from "react";
import GenericContractSearchResult from "./GenericContractSearchResult";
import ERC20Header from "./ERC20Header";
import ERC20Item, { ERC20ItemProps } from "./ERC20Item";
import { useContractSearch } from "../ots2/useUIHooks";
import { erc20MatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";

const AllERC20: FC = () => {
  const { pageNumber, results, total } = useContractSearch(
    "ERC20",
    erc20MatchParser
  );

  const page: ERC20ItemProps[] | undefined = useMemo(() => {
    return results?.results
      .map(
        (m): ERC20ItemProps => ({
          blockNumber: m.blockNumber,
          timestamp: results!.blocksSummary.get(m.blockNumber)!.timestamp,
          address: m.address,
          name: m.name,
          symbol: m.symbol,
          decimals: m.decimals,
        })
      )
      .reverse();
  }, [results]);

  document.title = `ERC20 Tokens | Otterscan`;

  return (
    <GenericContractSearchResult
      title="ERC20 tokens"
      header={<ERC20Header />}
      pageNumber={pageNumber}
      pageSize={PAGE_SIZE}
      total={total}
      page={page}
      Item={(m) => <ERC20Item {...m} />}
    />
  );
};

export default AllERC20;
