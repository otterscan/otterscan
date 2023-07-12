import { FC } from "react";
import GenericContractSearchResult from "./GenericContractSearchResult";
import ContractHeader from "./ContractHeader";
import ContractItem, { mapper } from "./ContractItem";
import { useContractSearchPage } from "../ots2/useUIHooks";
import { contractMatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";

const AllContracts: FC = () => {
  const { pageNumber, page, total } = useContractSearchPage(
    "AllContracts",
    contractMatchParser,
    mapper
  );

  document.title = `All contracts | Otterscan`;

  return (
    <GenericContractSearchResult
      title="ERC721 tokens"
      header={<ContractHeader />}
      cols={3}
      pageNumber={pageNumber}
      pageSize={PAGE_SIZE}
      total={total}
      page={page}
      Item={(m) => <ContractItem {...m} />}
    />
  );
};

export default AllContracts;
