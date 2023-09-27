import { FC } from "react";
import GenericContractSearchResult from "./GenericContractSearchResult";
import ContractHeader from "./ContractHeader";
import ContractItem, { mapper } from "./ContractItem";
import { useContractSearchPage } from "../ots2/useUIHooks";
import { contractMatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";
import { usePageTitle } from "../useTitle";

const AllContracts: FC = () => {
  const { pageNumber, page, total } = useContractSearchPage(
    "AllContracts",
    contractMatchParser,
    mapper
  );

  usePageTitle("All contracts");

  return (
    <GenericContractSearchResult
      title="All contracts"
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
