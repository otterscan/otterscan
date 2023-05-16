import { useContext, FC, useMemo } from "react";
import GenericContractSearchResult from "./GenericContractSearchResult";
import ERC1155Header from "./ERC1155Header";
import ERC1155Item, { ERC1155ItemProps } from "./ERC1155Item";
import { RuntimeContext } from "../useRuntime";
import { usePageNumber } from "../ots2/useUIHooks";
import {
  useGenericContractSearch,
  useGenericContractsCount,
} from "../ots2/usePrototypeHooks";
import { erc1155MatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";

const AllERC1155: FC = () => {
  const { provider } = useContext(RuntimeContext);

  const pageNumber = usePageNumber();
  const total = useGenericContractsCount(provider, "ERC1155");
  const results = useGenericContractSearch(
    provider,
    "ERC1155",
    pageNumber,
    PAGE_SIZE,
    total,
    erc1155MatchParser
  );
  const page: ERC1155ItemProps[] | undefined = useMemo(() => {
    return results?.results
      .map(
        (m): ERC1155ItemProps => ({
          blockNumber: m.blockNumber,
          timestamp: results!.blocksSummary.get(m.blockNumber)!.timestamp,
          address: m.address,
          name: m.name,
          symbol: m.symbol,
        })
      )
      .reverse();
  }, [results]);

  document.title = `ERC1155 Tokens | Otterscan`;

  return (
    <GenericContractSearchResult
      title="ERC1155 tokens"
      header={<ERC1155Header />}
      pageNumber={pageNumber}
      pageSize={PAGE_SIZE}
      total={total}
      page={page}
      Item={(m) => <ERC1155Item {...m} />}
    />
  );
};

export default AllERC1155;
