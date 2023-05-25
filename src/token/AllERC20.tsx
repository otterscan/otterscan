import { FC } from "react";
import GenericContractSearchResult from "./GenericContractSearchResult";
import ERC20Header from "./ERC20Header";
import ERC20Item, { mapper } from "./ERC20Item";
import { useContractSearchPage } from "../ots2/useUIHooks";
import { erc20MatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";

const AllERC20: FC = () => {
  const { pageNumber, page, total } = useContractSearchPage(
    "ERC20",
    erc20MatchParser,
    mapper
  );

  document.title = `ERC20 Tokens | Otterscan`;

  return (
    <GenericContractSearchResult
      title="ERC20 tokens"
      header={<ERC20Header />}
      cols={6}
      pageNumber={pageNumber}
      pageSize={PAGE_SIZE}
      total={total}
      page={page}
      Item={(m) => <ERC20Item {...m} />}
    />
  );
};

export default AllERC20;
