import { BlockTag, FixedNumber } from "ethers";
import React, { useContext } from "react";
import { useETHUSDOracle } from "../usePriceOracle";
import { RuntimeContext } from "../useRuntime";
import { commify } from "../utils/utils";

type TransactionItemFiatFeeProps = {
  blockTag: BlockTag;
  fee: bigint;
};

const TransactionItemFiatFee: React.FC<TransactionItemFiatFeeProps> = ({
  blockTag,
  fee,
}) => {
  const { provider } = useContext(RuntimeContext);
  const eth2USDValue = useETHUSDOracle(provider, blockTag);
  const fiatValue =
    eth2USDValue !== undefined
      ? (fee * eth2USDValue) / 100_000_000n
      : undefined;

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
