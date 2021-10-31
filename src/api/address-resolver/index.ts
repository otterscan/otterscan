import { BaseProvider } from "@ethersproject/providers";
import { IAddressResolver } from "./address-resolver";
import { CompositeAddressResolver } from "./CompositeAddressResolver";
import { ENSAddressResolver } from "./ENSAddressResolver";

export type ResolvedAddresses = Record<string, string>;

// Create and configure the main resolver
const _mainResolver = new CompositeAddressResolver();
_mainResolver.addResolver(new ENSAddressResolver());

export const mainResolver: IAddressResolver = _mainResolver;

export const batchPopulate = async (
  provider: BaseProvider,
  addresses: string[]
): Promise<ResolvedAddresses> => {
  const solvers: Promise<string | undefined>[] = [];
  for (const a of addresses) {
    solvers.push(mainResolver.resolveAddress(provider, a));
  }

  const results = await Promise.all(solvers);
  const cache: ResolvedAddresses = {};
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r === undefined) {
      continue;
    }
    cache[addresses[i]] = r;
  }

  return cache;
};
