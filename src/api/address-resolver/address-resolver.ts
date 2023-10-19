import { AbstractProvider } from "ethers";
import React from "react";

export interface IAddressResolver<T> {
  resolveAddress(
    provider: AbstractProvider,
    address: string,
  ): Promise<T | undefined>;
}

export type ResolvedAddressRenderer<T> = (
  chainId: bigint,
  address: string,
  resolvedAddress: T,
  linkable: boolean,
  dontOverrideColors: boolean,
) => React.ReactElement;
