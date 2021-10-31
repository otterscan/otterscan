import { BaseProvider } from "@ethersproject/providers";
import { IAddressResolver } from "./address-resolver";

export class CompositeAddressResolver implements IAddressResolver {
  private resolvers: IAddressResolver[] = [];

  addResolver(resolver: IAddressResolver) {
    this.resolvers.push(resolver);
  }

  async resolveAddress(
    provider: BaseProvider,
    address: string
  ): Promise<string | undefined> {
    for (const r of this.resolvers) {
      const name = r.resolveAddress(provider, address);
      if (name !== undefined) {
        return name;
      }
    }

    return undefined;
    // TODO: fallback to address itself
    // return address;
  }
}
