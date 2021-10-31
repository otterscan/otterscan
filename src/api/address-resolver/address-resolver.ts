import { BaseProvider } from "@ethersproject/providers";

export interface IAddressResolver {
  resolveAddress(
    provider: BaseProvider,
    address: string
  ): Promise<string | undefined>;
}
