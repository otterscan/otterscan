import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Disclosure } from "@headlessui/react";
import { Contract, JsonRpcApiProvider, ZeroAddress } from "ethers";
import { FC, useContext } from "react";
import USDAmount from "../../components/USDAmount";
import { useTokenBalance } from "../../ots2/usePrototypeTransferHooks";
import FormattedBalanceHighlighter from "../../selection/FormattedBalanceHighlighter";
import { ChecksummedAddress } from "../../types";
import { useTokenMetadata, type ExtendedBlock } from "../../useErigonHooks";
import { useTokenUSDOracle } from "../../usePriceOracle";
import { RuntimeContext } from "../../useRuntime";
import TransactionAddressWithCopy from "../components/TransactionAddressWithCopy";
import BalanceGraph from "./BalanceGraph";

import erc20 from "../../abi/erc20.json";
const ERC20_PROTOTYPE = new Contract(ZeroAddress, erc20);

type TokenBalanceProps = {
  holderAddress: ChecksummedAddress;
  tokenAddress: ChecksummedAddress;
};

async function getTokenBalance(
  provider: JsonRpcApiProvider,
  block: ExtendedBlock,
  holderAddress: string,
  tokenAddress: string,
): Promise<bigint | null> {
  const contract = ERC20_PROTOTYPE.connect(provider).attach(
    tokenAddress,
  ) as Contract;
  return contract.balanceOf(holderAddress, { blockTag: block.number });
}

const TokenBalance: FC<TokenBalanceProps> = ({
  holderAddress,
  tokenAddress,
}) => {
  const { provider } = useContext(RuntimeContext);
  const balance = useTokenBalance(provider, holderAddress, tokenAddress);
  const metadata = useTokenMetadata(provider, tokenAddress);
  const [quote, decimals] = useTokenUSDOracle(provider, "latest", tokenAddress);

  return (
    <tr>
      <td>
        <TransactionAddressWithCopy address={tokenAddress} />
      </td>
      <td>
        {balance !== null && balance !== undefined && (
          <Disclosure>
            <div className="flex justify-between">
              <div className="self-center">
                <FormattedBalanceHighlighter
                  value={balance}
                  decimals={metadata?.decimals ?? 0}
                />
                {metadata && quote !== undefined && decimals !== undefined && (
                  <USDAmount
                    amount={balance}
                    amountDecimals={metadata.decimals}
                    quote={quote}
                    quoteDecimals={decimals}
                  />
                )}
              </div>
              <div>
                <Disclosure.Button className="rounded border bg-skin-button-fill px-2 py-1 text-sm text-skin-button hover:bg-skin-button-hover-fill focus:outline-none">
                  <FontAwesomeIcon icon={faChartLine} />
                </Disclosure.Button>
              </div>
            </div>

            <Disclosure.Panel className="mt-2">
              <BalanceGraph
                balanceAtBlock={(provider, block) =>
                  getTokenBalance(provider, block, holderAddress, tokenAddress)
                }
                currencySymbol={metadata?.symbol ?? ""}
                currencyDecimals={metadata?.decimals ?? 18}
              />
            </Disclosure.Panel>
          </Disclosure>
        )}
      </td>
    </tr>
  );
};

export default TokenBalance;
