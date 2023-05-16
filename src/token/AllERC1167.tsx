import { FC, useMemo } from "react";
import GenericContractSearchResult from "./GenericContractSearchResult";
import ERC1167Header from "./ERC1167Header";
import ERC1167Item, { ERC1167ItemProps } from "./ERC1167Item";
import { useContractSearch } from "../ots2/useUIHooks";
import { erc1167MatchParser } from "../ots2/contractMatchParsers";
import { PAGE_SIZE } from "../params";

const AllERC1167: FC = () => {
  const { pageNumber, results, total } = useContractSearch(
    "ERC1167",
    erc1167MatchParser
  );

  const page: ERC1167ItemProps[] | undefined = useMemo(() => {
    return results?.results
      .map(
        (m): ERC1167ItemProps => ({
          blockNumber: m.blockNumber,
          timestamp: results!.blocksSummary.get(m.blockNumber)!.timestamp,
          address: m.address,
          implementation: m.implementation,
        })
      )
      .reverse();
  }, [results]);

  document.title = `ERC1167 Contracts | Otterscan`;

  return (
    <GenericContractSearchResult
      title="ERC1167 contracts"
      header={<ERC1167Header />}
      pageNumber={pageNumber}
      pageSize={PAGE_SIZE}
      total={total}
      page={page}
      Item={(m) => <ERC1167Item {...m} />}
    />
  );
};

export default AllERC1167;
