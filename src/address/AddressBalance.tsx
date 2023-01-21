import { FC } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import TransactionValue from "../components/TransactionValue";
import FiatValue from "../components/FiatValue";
import { useFiatValue } from "../usePriceOracle";

type AddressBalanceProps = {
  balance: BigNumber;
};

const AddressBalance: FC<AddressBalanceProps> = ({ balance }) => {
  const fiatValue = useFiatValue(balance, "latest");

  // TODO: inline div with space-x-2 here; verify all users
  return (
    <>
      <TransactionValue value={balance} />
      {fiatValue && (
        <FiatValue
          value={fiatValue}
          borderColor="border-emerald-200"
          bgColor="bg-emerald-100"
          fgColor="text-emerald-600"
        />
      )}
    </>
  );
};

export default AddressBalance;
