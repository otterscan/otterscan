import { useContext, FC, useMemo } from "react";
import GenericContractSearchResult from "./GenericContractSearchResult";
import ERC721Header from "./ERC721Header";
import ERC721Item, { ERC721ItemProps } from "./ERC721Item";
import { RuntimeContext } from "../useRuntime";
import { usePageNumber } from "../ots2/useUIHooks";
import {
  useGenericContractSearch,
  useGenericContractsCount,
} from "../ots2/usePrototypeHooks";
import { erc721MatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";

const AllERC721: FC = () => {
  const { provider } = useContext(RuntimeContext);

  const pageNumber = usePageNumber();
  const total = useGenericContractsCount(provider, "ERC721");
  const results = useGenericContractSearch(
    provider,
    "ERC721",
    pageNumber,
    PAGE_SIZE,
    total,
    erc721MatchParser
  );
  const page: ERC721ItemProps[] | undefined = useMemo(() => {
    return results?.results
      .map(
        (m): ERC721ItemProps => ({
          blockNumber: m.blockNumber,
          timestamp: results!.blocksSummary.get(m.blockNumber)!.timestamp,
          address: m.address,
          name: m.name,
          symbol: m.symbol,
        })
      )
      .reverse();
  }, [results]);

  document.title = `ERC721 Tokens | Otterscan`;

  return (
    <GenericContractSearchResult
      title="ERC721 tokens"
      header={<ERC721Header />}
      pageNumber={pageNumber}
      pageSize={PAGE_SIZE}
      total={total}
      page={page}
      Item={(m) => <ERC721Item {...m} />}
    />
  );
};

export default AllERC721;
