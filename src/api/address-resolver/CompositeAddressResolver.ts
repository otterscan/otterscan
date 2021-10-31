import { BaseProvider } from "@ethersproject/providers";
import { IAddressResolver } from "./address-resolver";

export type SelectedResolvedName<T> = [IAddressResolver<T>, T];

export class CompositeAddressResolver<T = any>
  implements IAddressResolver<SelectedResolvedName<T>>
{
  private resolvers: IAddressResolver<T>[] = [];

  addResolver(resolver: IAddressResolver<T>) {
    this.resolvers.push(resolver);
  }

  async resolveAddress(
    provider: BaseProvider,
    address: string
  ): Promise<SelectedResolvedName<T> | undefined> {
    for (const r of this.resolvers) {
      const resolvedAddress = await r.resolveAddress(provider, address);
      if (resolvedAddress !== undefined) {
        return [r, resolvedAddress];
      }
    }

    return undefined;
    // TODO: fallback to address itself
    // return address;
  }
}
