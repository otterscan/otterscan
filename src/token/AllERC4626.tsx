import { FC } from "react";
import GenericContractSearchResult from "./GenericContractSearchResult";
import ERC4626Header from "./ERC4626Header";
import ERC4626Item, { mapper } from "./ERC4626Item";
import { useContractSearchPage } from "../ots2/useUIHooks";
import { erc4626MatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";
import { usePageTitle } from "../useTitle";

const AllERC4626: FC = () => {
  const { pageNumber, page, total } = useContractSearchPage(
    "ERC4626",
    erc4626MatchParser,
    mapper,
  );

  usePageTitle("ERC4626 Tokens");

  return (
    <GenericContractSearchResult
      title="ERC4626 vaults"
      header={<ERC4626Header />}
      cols={8}
      pageNumber={pageNumber}
      pageSize={PAGE_SIZE}
      total={total}
      page={page}
      Item={(m) => <ERC4626Item {...m} />}
    />
  );
};

export default AllERC4626;
