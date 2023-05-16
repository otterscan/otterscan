import { useContext, FC, useMemo } from "react";
import GenericContractSearchResult from "./GenericContractSearchResult";
import ContractHeader from "./ContractHeader";
import ContractItem, { ContractItemProps } from "./ContractItem";
import { RuntimeContext } from "../useRuntime";
import { usePageNumber } from "../ots2/useUIHooks";
import {
  useGenericContractSearch,
  useGenericContractsCount,
} from "../ots2/usePrototypeHooks";
import { contractMatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";

const AllContracts: FC = () => {
  const { provider } = useContext(RuntimeContext);

  const pageNumber = usePageNumber();
  const total = useGenericContractsCount(provider, "AllContracts");
  const results = useGenericContractSearch(
    provider,
    "AllContracts",
    pageNumber,
    PAGE_SIZE,
    total,
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
