import { BaseProvider } from "@ethersproject/providers";
import { ensRenderer } from "../../components/ENSName";
import { tokenRenderer } from "../../components/TokenName";
import { IAddressResolver, ResolvedAddressRenderer } from "./address-resolver";
import {
  CompositeAddressResolver,
  SelectedResolvedName,
} from "./CompositeAddressResolver";
import { ENSAddressResolver } from "./ENSAddressResolver";
import { ERCTokenResolver } from "./ERCTokenResolver";

export type ResolvedAddresses = Record<string, SelectedResolvedName<any>>;

// Create and configure the main resolver
export const ensResolver = new ENSAddressResolver();
export const ercTokenResolver = new ERCTokenResolver();

const _mainResolver = new CompositeAddressResolver();
_mainResolver.addResolver(ensResolver);
_mainResolver.addResolver(ercTokenResolver);

export const mainResolver: IAddressResolver<SelectedResolvedName<any>> =
  _mainResolver;

export const resolverRendererRegistry = new Map<
  IAddressResolver<any>,
  ResolvedAddressRenderer<any>
>();
resolverRendererRegistry.set(ensResolver, ensRenderer);
resolverRendererRegistry.set(ercTokenResolver, tokenRenderer);

// TODO: implement progressive resolving
export const batchPopulate = async (
  provider: BaseProvider,
  addresses: string[],
  currentMap: ResolvedAddresses | undefined
): Promise<ResolvedAddresses> => {
  const solvers: Promise<SelectedResolvedName<any> | undefined>[] = [];
  const unresolvedAddresses = addresses.filter(
    (a) => currentMap?.[a] === undefined
  );
  for (const a of unresolvedAddresses) {
    solvers.push(mainResolver.resolveAddress(provider, a));
  }

  const resultMap: ResolvedAddresses = currentMap ? { ...currentMap } : {};
  const results = await Promise.all(solvers);
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r === undefined) {
      continue;
    }
    resultMap[unresolvedAddresses[i]] = r;
  }

  return resultMap;
};
