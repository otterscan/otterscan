import { AbstractProvider } from "ethers";
import { IAddressResolver } from "./address-resolver";

export type SelectedResolvedName<T> = [IAddressResolver<T>, T] | null;

export class CompositeAddressResolver<T = any>
  implements IAddressResolver<SelectedResolvedName<T>>
{
  private resolvers: IAddressResolver<T>[] = [];

  addResolver(resolver: IAddressResolver<T>) {
    this.resolvers.push(resolver);
  }

  async resolveAddress(
    provider: AbstractProvider,
    address: string,
  ): Promise<SelectedResolvedName<T> | undefined> {
    for (const r of this.resolvers) {
      try {
        const resolvedAddress = await r.resolveAddress(provider, address);
        if (resolvedAddress !== undefined) {
          return [r, resolvedAddress];
        }
      } catch (err) {
        console.warn(`Error while trying to resolve addr ${address}`);
        console.warn(err);
      }
    }

    return null;
  }
}
