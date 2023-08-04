import React, { useContext } from "react";
import { BlockTag } from "@ethersproject/providers";
import { BigNumber, FixedNumber } from "@ethersproject/bignumber";
import { commify } from "@ethersproject/units";
import { RuntimeContext } from "../useRuntime";
import { useETHUSDOracle } from "../usePriceOracle";

type TransactionItemFiatFeeProps = {
  blockTag: BlockTag;
  fee: BigNumber;
};

const TransactionItemFiatFee: React.FC<TransactionItemFiatFeeProps> = ({
  blockTag,
  fee,
}) => {
  const { provider } = useContext(RuntimeContext);
  const eth2USDValue = useETHUSDOracle(provider, blockTag);
  const fiatValue =
    eth2USDValue !== undefined ? fee.mul(eth2USDValue).div(10 ** 8) : undefined;

  return fiatValue ? (
    <span className="text-xs">
      $
      <span className="font-balance">
        {commify(FixedNumber.fromValue(fiatValue, 18).round(2).toString())}
      </span>
    </span>
  ) : (
    <>N/A</>
  );
};

export default TransactionItemFiatFee;
