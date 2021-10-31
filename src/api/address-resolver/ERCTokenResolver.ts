import { BaseProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { IAddressResolver } from "./address-resolver";
import erc20 from "../../erc20.json";

export class ERCTokenResolver implements IAddressResolver<string> {
  async resolveAddress(
    provider: BaseProvider,
    address: string
  ): Promise<string | undefined> {
    const erc20Contract = new Contract(address, erc20, provider);
    try {
      const [name, symbol, decimals] = await Promise.all([
        erc20Contract.name(),
        erc20Contract.symbol(),
        erc20Contract.decimals(),
      ]);
      return name;
    } catch (err) {
      console.warn(`Couldn't get token ${address} metadata; ignoring`, err);
    }
    return undefined;
  }
}
