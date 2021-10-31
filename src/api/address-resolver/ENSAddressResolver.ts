import { BaseProvider } from "@ethersproject/providers";
import { IAddressResolver } from "./address-resolver";

export class ENSAddressResolver implements IAddressResolver {
  async resolveAddress(
    provider: BaseProvider,
    address: string
  ): Promise<string | undefined> {
    const name = await provider.lookupAddress(address);
    if (name === null) {
      return undefined;
    }
    return name;
  }
}
