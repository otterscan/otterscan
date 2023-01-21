import React, { useContext } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import TransactionValue from "../components/TransactionValue";
import FiatValue from "../components/FiatValue";
import { RuntimeContext } from "../useRuntime";
import { useETHUSDOracle } from "../usePriceOracle";

type AddressBalanceProps = {
  balance: BigNumber;
};

const AddressBalance: React.FC<AddressBalanceProps> = ({ balance }) => {
  const { provider } = useContext(RuntimeContext);
  const eth2USDValue = useETHUSDOracle(provider, "latest");
  const fiatValue =
    !balance.isZero() && eth2USDValue !== undefined
      ? balance.mul(eth2USDValue).div(10 ** 8)
      : undefined;

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
