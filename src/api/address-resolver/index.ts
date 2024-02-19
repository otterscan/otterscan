import { ensRenderer } from "../../execution/address/renderer/ENSName";
import { plainStringRenderer } from "../../execution/address/renderer/PlainString";
import { tokenRenderer } from "../../execution/address/renderer/TokenName";
import { uniswapV1PairRenderer } from "../../execution/address/renderer/UniswapV1ExchangeName";
import { uniswapV2PairRenderer } from "../../execution/address/renderer/UniswapV2PairName";
import { uniswapV3PairRenderer } from "../../execution/address/renderer/UniswapV3PoolName";
import {
  CompositeAddressResolver,
  SelectedResolvedName,
} from "./CompositeAddressResolver";
import { ENSAddressResolver } from "./ENSAddressResolver";
import { ERCTokenResolver } from "./ERCTokenResolver";
import { HardcodedAddressResolver } from "./HardcodedAddressResolver";
import { UniswapV1Resolver } from "./UniswapV1Resolver";
import { UniswapV2Resolver } from "./UniswapV2Resolver";
import { UniswapV3Resolver } from "./UniswapV3Resolver";
import { AddressResolver, ResolvedAddressRenderer } from "./address-resolver";

export type ResolvedAddresses = Record<string, SelectedResolvedName<any>>;

// Create and configure the main resolver
const ensResolver = new ENSAddressResolver();
const uniswapV1Resolver = new UniswapV1Resolver();
const uniswapV2Resolver = new UniswapV2Resolver();
const uniswapV3Resolver = new UniswapV3Resolver();
const ercTokenResolver = new ERCTokenResolver();
const hardcodedResolver = new HardcodedAddressResolver();

const _mainnetResolver = new CompositeAddressResolver();
_mainnetResolver.addResolver(ensResolver);
_mainnetResolver.addResolver(uniswapV3Resolver);
_mainnetResolver.addResolver(uniswapV2Resolver);
_mainnetResolver.addResolver(uniswapV1Resolver);
_mainnetResolver.addResolver(ercTokenResolver);
_mainnetResolver.addResolver(hardcodedResolver);

const _defaultResolver = new CompositeAddressResolver();
_defaultResolver.addResolver(ercTokenResolver);
_defaultResolver.addResolver(hardcodedResolver);

const resolvers: Record<string, AddressResolver<SelectedResolvedName<any>>> = {
  "1": _mainnetResolver,
  "0": _defaultResolver,
};

export const getResolver = (
  chainId: bigint,
): AddressResolver<SelectedResolvedName<any>> => {
  const res = resolvers[chainId.toString()];
  if (res === undefined) {
    return resolvers["0"]; // default MAGIC NUMBER
  }
  return res;
};

export const resolverRendererRegistry = new Map<
  AddressResolver<any>,
  ResolvedAddressRenderer<any>
>();
resolverRendererRegistry.set(ensResolver, ensRenderer);
resolverRendererRegistry.set(uniswapV1Resolver, uniswapV1PairRenderer);
resolverRendererRegistry.set(uniswapV2Resolver, uniswapV2PairRenderer);
resolverRendererRegistry.set(uniswapV3Resolver, uniswapV3PairRenderer);
resolverRendererRegistry.set(ercTokenResolver, tokenRenderer);
resolverRendererRegistry.set(hardcodedResolver, plainStringRenderer);
