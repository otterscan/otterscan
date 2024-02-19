import { JsonRpcApiProvider } from "ethers";
import { BasicAddressResolver } from "./address-resolver";

type HardcodedAddressMap = Record<string, string | undefined>;

export class HardcodedAddressResolver extends BasicAddressResolver {
  async resolveAddress(
    provider: JsonRpcApiProvider,
    address: string,
  ): Promise<string | undefined> {
    try {
      const addressMap: HardcodedAddressMap = (
        await import(`./hardcoded-addresses/${provider._network.chainId}.json`)
      ).default;

      return addressMap[address];
    } catch (err) {
      // Ignore on purpose
      return undefined;
    }
  }

  trusted(resolvedAddress: string | undefined): boolean | undefined {
    return true;
  }
}
