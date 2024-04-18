import { FC, useContext } from "react";
import { useTokenBalance } from "../../ots2/usePrototypeTransferHooks";
import { ChecksummedAddress } from "../../types";
import { RuntimeContext } from "../../useRuntime";
import TokenAmount from "./TokenAmount";

type TokenBalanceProps = {
  holderAddress: ChecksummedAddress;
  tokenAddress: ChecksummedAddress;
};

const TokenBalance: FC<TokenBalanceProps> = ({
  holderAddress,
  tokenAddress,
}) => {
  const { provider } = useContext(RuntimeContext);
  const balance = useTokenBalance(provider, holderAddress, tokenAddress);

  return (
    <tr>
      <TokenAmount tokenAddress={tokenAddress} amount={balance} />
    </tr>
  );
};

export default TokenBalance;
