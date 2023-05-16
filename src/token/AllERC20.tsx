import { useContext, FC, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import GenericContractSearchResult from "./GenericContractSearchResult";
import ERC20Header from "./ERC20Header";
import ERC20Item, { ERC20ItemProps } from "./ERC20Item";
import { RuntimeContext } from "../useRuntime";
import {
  useGenericContractSearch,
  useGenericContractsCount,
} from "../ots2/usePrototypeHooks";
import { erc20MatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";

const AllERC20: FC = () => {
  const { provider } = useContext(RuntimeContext);

  const [searchParams] = useSearchParams();
  let pageNumber = 1;
  const p = searchParams.get("p");
  if (p) {
    try {
      pageNumber = parseInt(p);
    } catch (err) {}
  }

  const total = useGenericContractsCount(provider, "ERC20");
  const results = useGenericContractSearch(
    provider,
    "ERC20",
    pageNumber,
    PAGE_SIZE,
    total,
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
