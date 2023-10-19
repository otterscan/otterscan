import { FC } from "react";
import { erc1155MatchParser } from "../ots2/contractMatchParsers";
import { useContractSearchPage } from "../ots2/useUIHooks";
import { PAGE_SIZE } from "../params";
import { usePageTitle } from "../useTitle";
import ERC1155Header from "./ERC1155Header";
import ERC1155Item, { mapper } from "./ERC1155Item";
import GenericContractSearchResult from "./GenericContractSearchResult";

const AllERC1155: FC = () => {
  const { pageNumber, page, total } = useContractSearchPage(
    "ERC1155",
    erc1155MatchParser,
    mapper,
  );

  usePageTitle("ERC1155 Tokens");

  return (
    <GenericContractSearchResult
      title="ERC1155 tokens"
      header={<ERC1155Header />}
      cols={5}
      pageNumber={pageNumber}
      pageSize={PAGE_SIZE}
      total={total}
      page={page}
      Item={(m) => <ERC1155Item {...m} />}
    />
  );
};

export default AllERC1155;
