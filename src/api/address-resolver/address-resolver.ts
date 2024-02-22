import { AbstractProvider } from "ethers";
import React from "react";

export abstract class AddressResolver<T> {
  abstract resolveAddress(
    provider: AbstractProvider,
    address: string,
  ): Promise<T | undefined>;

  abstract resolveToString(resolvedAddress: T | undefined): string | undefined;
  abstract trusted(resolvedAddress: T | undefined): boolean | undefined;
}

export abstract class BasicAddressResolver extends AddressResolver<string> {
  resolveToString(resolvedAddress: string | undefined): string | undefined {
    return resolvedAddress;
  }
}

export type ResolvedAddressRenderer<T> = (
  chainId: bigint,
  address: string,
  resolvedAddress: T,
  linkable: boolean,
  dontOverrideColors: boolean,
) => React.ReactElement;
