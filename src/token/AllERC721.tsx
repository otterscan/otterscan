import { FC } from "react";
import GenericContractSearchResult from "./GenericContractSearchResult";
import ERC721Header from "./ERC721Header";
import ERC721Item, { mapper } from "./ERC721Item";
import { useContractSearchPage } from "../ots2/useUIHooks";
import { erc721MatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";

const AllERC721: FC = () => {
  const { pageNumber, page, total } = useContractSearchPage(
    "ERC721",
    erc721MatchParser,
    mapper
  );

  document.title = `ERC721 Tokens | Otterscan`;

  return (
    <GenericContractSearchResult
      title="ERC721 tokens"
      header={<ERC721Header />}
      cols={5}
      pageNumber={pageNumber}
      pageSize={PAGE_SIZE}
      total={total}
      page={page}
      Item={(m) => <ERC721Item {...m} />}
    />
  );
};

export default AllERC721;
