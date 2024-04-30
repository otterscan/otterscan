import { AbstractProvider } from "ethers";
import { BasicAddressResolver } from "./address-resolver";

export class ENSAddressResolver extends BasicAddressResolver {
  async resolveAddress(
    provider: AbstractProvider,
    address: string,
  ): Promise<string | undefined> {
    const name = await provider.lookupAddress(address);
    if (name === null) {
      return undefined;
    }
    return name;
  }

  trusted(resolvedAddress: string | undefined): boolean | undefined {
    return true;
  }
}
