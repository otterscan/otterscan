import { FC } from "react";
import { erc1167MatchParser } from "../ots2/contractMatchParsers";
import { useContractSearchPage } from "../ots2/useUIHooks";
import { PAGE_SIZE } from "../params";
import { usePageTitle } from "../useTitle";
import ERC1167Header from "./ERC1167Header";
import ERC1167Item, { mapper } from "./ERC1167Item";
import GenericContractSearchResult from "./GenericContractSearchResult";

const AllERC1167: FC = () => {
  const { pageNumber, page, total } = useContractSearchPage(
    "ERC1167",
    erc1167MatchParser,
    mapper,
  );

  usePageTitle("ERC1167 Contracts");

  return (
    <GenericContractSearchResult
      title="ERC1167 proxies"
      header={<ERC1167Header />}
      cols={4}
      pageNumber={pageNumber}
      pageSize={PAGE_SIZE}
      total={total}
      page={page}
      Item={(m) => <ERC1167Item {...m} />}
    />
  );
};

export default AllERC1167;
