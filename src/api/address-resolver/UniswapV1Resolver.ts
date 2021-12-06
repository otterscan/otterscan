import { BaseProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { IAddressResolver } from "./address-resolver";
import { ChecksummedAddress, TokenMeta } from "../../types";
import { ERCTokenResolver } from "./ERCTokenResolver";

const UNISWAP_V1_FACTORY = "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95";

const UNISWAP_V1_FACTORY_ABI = [
  "function getToken(address exchange) external view returns (address token)",
];

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export type UniswapV1TokenMeta = {
  address: ChecksummedAddress;
} & TokenMeta;

export type UniswapV1PairMeta = {
  exchange: ChecksummedAddress;
  token: UniswapV1TokenMeta;
};

const ercResolver = new ERCTokenResolver();

export class UniswapV1Resolver implements IAddressResolver<UniswapV1PairMeta> {
  async resolveAddress(
    provider: BaseProvider,
    address: string
  ): Promise<UniswapV1PairMeta | undefined> {
    const factoryContract = new Contract(
      UNISWAP_V1_FACTORY,
      UNISWAP_V1_FACTORY_ABI,
      provider
    );

    try {
      // First, probe the getToken() function; if it responds with an UniswapV1 exchange
      // address, it is a LP
      const token = (await factoryContract.getToken(address)) as string;
      if (token === NULL_ADDRESS) {
        return undefined;
      }

      const metadata = await ercResolver.resolveAddress(provider, token);
      if (metadata === undefined) {
        return undefined;
      }

      return {
        exchange: address,
        token: { address: token, ...metadata },
      };
    } catch (err) {
      // Ignore on purpose; this indicates the probe failed and the address
      // is not a token
    }
    return undefined;
  }
}
