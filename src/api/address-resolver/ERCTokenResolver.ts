import { BaseProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { IAddressResolver } from "./address-resolver";
import erc20 from "../../erc20.json";
import { TokenMeta } from "../../types";

export class ERCTokenResolver implements IAddressResolver<TokenMeta> {
  async resolveAddress(
    provider: BaseProvider,
    address: string
  ): Promise<TokenMeta | undefined> {
    const erc20Contract = new Contract(address, erc20, provider);
    try {
      const [name, symbol, decimals] = (await Promise.all([
        erc20Contract.name(),
        erc20Contract.symbol(),
        erc20Contract.decimals(),
      ])) as [string, string, number];

      // Prevent faulty tokens with empty name/symbol
      if (!name.trim() || !symbol.trim()) {
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
}
