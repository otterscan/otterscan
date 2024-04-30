import { AbstractProvider } from "ethers";
import { AddressResolver } from "./address-resolver";

export type SelectedResolvedName<T> = [AddressResolver<T>, T] | null;

export class CompositeAddressResolver<T = any>
  implements AddressResolver<SelectedResolvedName<T>>
{
  private resolvers: AddressResolver<T>[] = [];

  addResolver(resolver: AddressResolver<T>) {
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

  resolveToString(
    resolvedAddress: SelectedResolvedName<T> | undefined,
  ): string | undefined {
    if (!resolvedAddress) {
      return undefined;
    }
    return resolvedAddress[0].resolveToString(resolvedAddress[1]);
  }

  trusted(
    resolvedAddress: SelectedResolvedName<T> | undefined,
  ): boolean | undefined {
    if (!resolvedAddress) {
      return undefined;
    }
    return resolvedAddress[0].trusted(resolvedAddress[1]);
  }
}
