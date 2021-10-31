import { BaseProvider } from "@ethersproject/providers";
import { IAddressResolver } from "./address-resolver";

export type SelectedResolvedName<T> = [IAddressResolver<T>, T];

export class CompositeAddressResolver<T>
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
      const name = await r.resolveAddress(provider, address);
      if (name !== undefined) {
        return [r, name];
      }
    }

    return undefined;
    // TODO: fallback to address itself
    // return address;
  }
}
