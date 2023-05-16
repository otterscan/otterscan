import { FC, useMemo } from "react";
import GenericContractSearchResult from "./GenericContractSearchResult";
import ContractHeader from "./ContractHeader";
import ContractItem, { ContractItemProps } from "./ContractItem";
import { useContractSearch } from "../ots2/useUIHooks";
import { contractMatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";

const AllContracts: FC = () => {
  const { pageNumber, results, total } = useContractSearch(
    "AllContracts",
    contractMatchParser
  );

  const page: ContractItemProps[] | undefined = useMemo(() => {
    return results?.results
      .map(
        (m): ContractItemProps => ({
          blockNumber: m.blockNumber,
          timestamp: results!.blocksSummary.get(m.blockNumber)!.timestamp,
          address: m.address,
        })
      )
      .reverse();
  }, [results]);

  document.title = `All contracts | Otterscan`;

  return (
    <GenericContractSearchResult
      title="ERC721 tokens"
      header={<ContractHeader />}
      pageNumber={pageNumber}
      pageSize={PAGE_SIZE}
      total={total}
      page={page}
      Item={(m) => <ContractItem {...m} />}
    />
  );
};

export default AllContracts;
