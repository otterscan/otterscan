import { FC } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import TransactionValue from "../../components/TransactionValue";
import FiatValue from "../../components/FiatValue";
import { useFiatValue } from "../../usePriceOracle";

type AddressBalanceProps = {
  balance: BigNumber;
};

const AddressBalance: FC<AddressBalanceProps> = ({ balance }) => {
  const fiatValue = useFiatValue(balance, "latest");

  return (
    <div className="space-x-2">
      <TransactionValue value={balance} />
      {fiatValue && (
        <FiatValue
          value={fiatValue}
          borderColor="border-emerald-200"
          bgColor="bg-emerald-100"
          fgColor="text-emerald-600"
        />
      )}
    </div>
  );
};

export default AddressBalance;
