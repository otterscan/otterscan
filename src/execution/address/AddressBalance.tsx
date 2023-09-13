import { JsonRpcApiProvider } from "ethers";
import { FC } from "react";
import ContentFrame from "../../components/ContentFrame";
import { ChecksummedAddress } from "../../types";
import { useChainInfo } from "../../useChainInfo";
import { type ExtendedBlock } from "../../useErigonHooks";
import { AddressAwareComponentProps } from "../types";

import BalanceGraph from "./BalanceGraph";

async function balanceAtBlock(
  provider: JsonRpcApiProvider,
  block: ExtendedBlock,
  address: ChecksummedAddress,
) {
  return provider.getBalance(address, block.number);
}

const AddressBalance: FC<AddressAwareComponentProps> = ({ address }) => {
  const {
    nativeCurrency: { symbol: currencySymbol, decimals: currencyDecimals },
  } = useChainInfo();

  return (
    <ContentFrame tabs>
      <BalanceGraph
        balanceAtBlock={(provider, block) =>
          balanceAtBlock(provider, block, address)
        }
        currencySymbol={currencySymbol}
        currencyDecimals={currencyDecimals}
      />
    </ContentFrame>
  );
};

export default AddressBalance;
