import { useContext, FC, useMemo } from "react";
import GenericTransactionSearchResult from "./GenericTransactionSearchResult";
import ERC20Item, { ERC20ItemProps } from "./ERC20Item";
import { RuntimeContext } from "../../useRuntime";
import {
  useGenericTransactionCount,
  useGenericTransactionList,
} from "../../ots2/usePrototypeTransferHooks";
import { usePageNumber } from "../../ots2/useUIHooks";
import { AddressAwareComponentProps } from "../types";
import { PAGE_SIZE } from "../../params";

const AddressERC721Results: FC<AddressAwareComponentProps> = ({ address }) => {
  const { provider } = useContext(RuntimeContext);

  const pageNumber = usePageNumber();
  const total = useGenericTransactionCount(provider, "ERC721", address);
  const results = useGenericTransactionList(
    provider,
    "ERC721",
    address,
    pageNumber,
    PAGE_SIZE,
    total
  );
  const items = useMemo(
    () =>
      results?.results.map(
        (m): ERC20ItemProps => ({
          address,
          blockNumber: m.receipt.blockNumber,
          timestamp:
            results.blocksSummary.get(m.receipt.blockNumber)?.timestamp ?? 0, // TODO: fix get
          hash: m.transaction.hash,
          status: m.receipt.status!,
          data: m.transaction.data,
          from: m.receipt.from,
          to: m.receipt.to,
          value: m.transaction.value,
        })
      ),
    [results]
  );

  document.title = `ERC721 Transfers | Otterscan`;

  return (
    <GenericTransactionSearchResult
      pageNumber={pageNumber}
      total={total}
      items={items}
      Item={(i) => <ERC20Item {...i} />}
    />
  );
};

export default AddressERC721Results;
