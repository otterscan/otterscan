import { JsonRpcApiProvider } from "ethers";
import { BasicAddressResolver } from "./address-resolver";

type AddressMap = Record<string, string | undefined>;

/*
    A singleton class so addresses aren't fetched more than once
*/
export class CustomLabelFetcher {
  private static instance: CustomLabelFetcher;
  private fetchedLabels: Map<string, string> = new Map();
  private localStorageLabels: Map<string, string> = new Map();
  private fetched: boolean = false;
  // List of URLs from which address-label mappings are fetched
  // TODO: Potentially populate from the config file
  private defaultLabelSources: string[] = [];

  private constructor() {}

  public static getInstance(): CustomLabelFetcher {
    if (!CustomLabelFetcher.instance) {
      CustomLabelFetcher.instance = new CustomLabelFetcher();
    }
    return CustomLabelFetcher.instance;
  }

  public async fetchLabels(localOnly: boolean = false) {
    // Fetch labels from label sources
    if (!localOnly) {
      const _this = this;
      async function fetchLabels(url: string) {
        try {
          const response = await fetch(url);
          const data = (await response.json()) as {
            [key: string]: string;
          };
          Object.entries(data).forEach(([key, value]: [string, string]) =>
            _this.fetchedLabels.set(key, value),
          );
        } catch (e) {
          console.error(`Error loading address labels from ${url}:`, e);
        }
      }

      await Promise.all(
        this.defaultLabelSources.map((url: string) => fetchLabels(url)),
      );
    }

    // Load labels from localStorage
    this.localStorageLabels.clear();
    const localStorageAddrsString = localStorage.getItem("customAddressLabels");
    if (typeof localStorageAddrsString === "string") {
      try {
        const localLabels = JSON.parse(localStorageAddrsString) as [
          string,
          string,
        ][];
        for (let addressTag of localLabels) {
          this.localStorageLabels.set(addressTag[0], addressTag[1]);
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (!localOnly) {
      this.fetched = true;
    }
  }

  public async updateLabels(newItem: { [address: string]: string }) {
    // Update our view of the localStorage addresses
    await this.fetchLabels(true);
    Object.entries(newItem).forEach(([key, value]) => {
      if (value === "") {
        this.localStorageLabels.delete(key);
      } else {
        this.localStorageLabels.set(key, value);
      }
    });
    localStorage.setItem(
      "customAddressLabels",
      JSON.stringify([...this.localStorageLabels]),
    );
  }

  public async getItem(key: string): Promise<string | undefined> {
    if (!this.fetched) {
      await this.fetchLabels();
    }
    // localStorage labels have priority
    if (this.localStorageLabels.has(key)) {
      return this.localStorageLabels.get(key);
    } else if (this.fetchedLabels.has(key)) {
      return this.fetchedLabels.get(key);
    } else {
      return undefined;
    }
  }

  public getAllAddresses(): string[] {
    return Array.from(this.localStorageLabels.keys());
  }

  public clearAll() {
    this.localStorageLabels.clear();
    this.localStorageLabels.clear();
  }
}

export class CustomLabelResolver extends BasicAddressResolver {
  async resolveAddress(
    provider: JsonRpcApiProvider,
    address: string,
  ): Promise<string | undefined> {
    const labelFetcher = CustomLabelFetcher.getInstance();
    const label = await labelFetcher.getItem(address);
    return label;
  }

  trusted(resolvedAddress: string | undefined): boolean | undefined {
    return true;
  }
}
