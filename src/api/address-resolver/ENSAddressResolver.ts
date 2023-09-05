import { AbstractProvider } from "ethers";
import { IAddressResolver } from "./address-resolver";

export class ENSAddressResolver implements IAddressResolver<string> {
  async resolveAddress(
    provider: AbstractProvider,
    address: string
  ): Promise<string | undefined> {
    const name = await provider.lookupAddress(address);
    if (name === null) {
      return undefined;
    }
    return name;
  }
}
