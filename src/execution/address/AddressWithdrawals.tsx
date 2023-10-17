import { useContext, FC, useMemo } from "react";
import GenericTransactionSearchResult from "./GenericTransactionSearchResult";
import { RuntimeContext } from "../../useRuntime";
import {
  useGenericTransactionCount,
  useGenericTransactionList,
} from "../../ots2/usePrototypeTransferHooks";
import { usePageNumber } from "../../ots2/useUIHooks";
import { AddressAwareComponentProps } from "../types";
import { PAGE_SIZE } from "../../params";
import StandardTHead from "../../components/StandardTHead";
import { usePageTitle } from "../../useTitle";
import WithdrawalItem, { WithdrawalItemProps } from "./WithdrawalItem";

const withdrawalSearchHeader = (
  <StandardTHead>
    <th className="w-28">Index</th>
    <th className="w-28">Block</th>
    <th className="w-36">Age</th>
    <th className="w-32">Validator</th>
    <th className="w-52">To</th>
    <th className="w-44">Value</th>
  </StandardTHead>
);

const AddressWithdrawalsResults: FC<AddressAwareComponentProps> = ({
  address,
}) => {
  const { provider } = useContext(RuntimeContext);

  const pageNumber = usePageNumber();
  const total = useGenericTransactionCount(provider, "Withdrawals", address);
  const results = useGenericTransactionList(
    provider,
    "Withdrawals",
    address,
    pageNumber,
    PAGE_SIZE,
    total,
  );

  const items = useMemo(
    () =>
      results?.results.map(
        (withdrawal): WithdrawalItemProps & { hash: string } => ({
          address,
          index: withdrawal.index,
          blockNumber: withdrawal.blockNumber,
          timestamp:
            results.blocksSummary.get(withdrawal.blockNumber)?.timestamp ?? 0, // TODO: fix get
          validatorIndex: withdrawal.validatorIndex,
          amount: withdrawal.amount,
          hash: withdrawal.index.toString(),
        }),
      ),
    [results],
  );

  usePageTitle(`Withdrawals | ${address}`);

  return (
    <GenericTransactionSearchResult
      pageNumber={pageNumber}
      total={total}
      items={items}
      Item={(i) => <WithdrawalItem {...i} />}
      header={withdrawalSearchHeader}
      typeName="withdrawal"
      columns={6}
    />
  );
};

export default AddressWithdrawalsResults;
