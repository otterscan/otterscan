import { BaseProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { Interface } from "@ethersproject/abi";
import { IAddressResolver } from "./address-resolver";
import erc20 from "../../erc20.json";
import { TokenMeta } from "../../types";

const erc20Interface = new Interface(erc20);

export class ERCTokenResolver implements IAddressResolver<TokenMeta> {
  async resolveAddress(
    provider: BaseProvider,
    address: string
  ): Promise<TokenMeta | undefined> {
    const erc20Contract = new Contract(address, erc20Interface, provider);
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
}
