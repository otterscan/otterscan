import { FC } from "react";
import { erc20MatchParser } from "../ots2/contractMatchParsers";
import { useContractSearchPage } from "../ots2/useUIHooks";
import { PAGE_SIZE } from "../params";
import { usePageTitle } from "../useTitle";
import ERC20Header from "./ERC20Header";
import ERC20Item, { mapper } from "./ERC20Item";
import GenericContractSearchResult from "./GenericContractSearchResult";

const AllERC20: FC = () => {
  const { pageNumber, page, total } = useContractSearchPage(
    "ERC20",
    erc20MatchParser,
    mapper,
  );

  usePageTitle("ERC20 Tokens");

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
