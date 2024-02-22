import { AbstractProvider, Contract, ZeroAddress } from "ethers";
import erc20 from "../../abi/erc20.json";
import { TokenMeta } from "../../types";
import { AddressResolver } from "./address-resolver";

const ERC20_PROTOTYPE = new Contract(ZeroAddress, erc20);

export class ERCTokenResolver implements AddressResolver<TokenMeta> {
  async resolveAddress(
    provider: AbstractProvider,
    address: string,
  ): Promise<TokenMeta | undefined> {
    // TODO: Remove "as Contract" workaround for https://github.com/ethers-io/ethers.js/issues/4183
    const erc20Contract = ERC20_PROTOTYPE.connect(provider).attach(
      address,
    ) as Contract;
    try {
      const name = (await erc20Contract.name()) as string;
      if (!name.trim()) {
        return undefined;
      }

      const [symbol, decimals] = (await Promise.all([
        erc20Contract.symbol(),
        erc20Contract.decimals(),
      ])) as [string, number];

      // Prevent faulty tokens with empty name/symbol
      if (!symbol.trim()) {
        return undefined;
      }

      return {
        name,
        symbol,
        decimals,
      };
    } catch (err) {
      // Ignore on purpose; this indicates the probe failed and the address
      // is not a token
    }
    return undefined;
  }

  resolveToString(resolvedAddress: TokenMeta | undefined): string | undefined {
    if (resolvedAddress === undefined) {
      return undefined;
    }
    return `${resolvedAddress.name} (${resolvedAddress.symbol})`;
  }

  trusted(resolvedAddress: TokenMeta | undefined): boolean | undefined {
    return true;
  }
}
