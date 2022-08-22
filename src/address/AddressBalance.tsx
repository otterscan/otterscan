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

  return (
    <>
      <TransactionValue value={balance} />
      {fiatValue && (
        <span className="px-2 border-emerald-200 border rounded-lg bg-emerald-100 text-emerald-600">
          <FiatValue value={fiatValue} />
        </span>
      )}
    </>
  );
};

export default AddressBalance;
