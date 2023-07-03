import { Zilliqa } from '@zilliqa-js/zilliqa'
import { useLocation } from 'react-router-dom';

export class DataService {
  zilliqa: Zilliqa;
  networkUrl: string;
  
  constructor(networkUrl: string | null) {
    if (networkUrl) {
      this.networkUrl = networkUrl;
      this.zilliqa = new Zilliqa(networkUrl);
    } else {
      this.networkUrl = "https://api.zilliqa.com";
      this.zilliqa = new Zilliqa("https:/api.zilliqa.com");
    }
  }

  useNetworkUrl = (): string => {
    return new URLSearchParams(useLocation().search).get("network") || "";
  };

  async getContractAddrFromTransaction(txnHash: string): Promise<string> {
    console.log("getting smart contracts addr");
    const response = await this.zilliqa.blockchain.getContractAddressFromTransactionID(
      txnHash
    );
    if (response.error !== undefined) throw new Error(response.error.message);
    return response.result as string;
  }
}