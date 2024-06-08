import { JsonRpcApiProvider } from "ethers";
import { BasicAddressResolver } from "./address-resolver";

type AddressMap = Record<string, string | undefined>;

/*
    A singleton class so addresses aren't fetched more than once
*/
export class LocalStorageCustomLabelFetcher {
  private static instance: LocalStorageCustomLabelFetcher;
  private fetchedLabels: Map<string, string> = new Map();
  private localStorageLabels: Map<string, string> = new Map();
  private fetched: boolean = false;
  // List of URLs from which address-label mappings are fetched
  // TODO: Potentially populate from the config file
  private defaultLabelSources: string[] = [];

  private constructor() {}

  public static getInstance(): LocalStorageCustomLabelFetcher {
    if (!LocalStorageCustomLabelFetcher.instance) {
      LocalStorageCustomLabelFetcher.instance =
        new LocalStorageCustomLabelFetcher();
    }
    return LocalStorageCustomLabelFetcher.instance;
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

  public async getAllAddresses(): Promise<string[]> {
    return Array.from(this.localStorageLabels.keys());
  }

  public clearAll() {
    this.localStorageLabels.clear();
    this.localStorageLabels.clear();
  }
}

export function getNestedProperty(
  obj: any,
  path: string,
  defaultValue: any,
): any {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0; i < parts.length; i++) {
    if (current[parts[i]] === undefined) {
      return defaultValue;
    }
    current = current[parts[i]];
  }
  return current;
}

export function setNestedProperty(obj: any, path: string, value: any) {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] === undefined) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

export class GitHubCustomLabelFetcher {
  private static instance: GitHubCustomLabelFetcher;
  private fetchedLabels: Map<string, string | null> = new Map();

  private token: string | null = null;
  private owner: string | null = null;
  private repo: string | null = null;

  async loadSettings() {
    const settings = JSON.parse(
      (await localStorage.getItem("settings")) || "{}",
    );
    this.token = getNestedProperty(
      settings,
      "github-address-labels.token",
      null,
    );
    this.owner = getNestedProperty(
      settings,
      "github-address-labels.username",
      null,
    );
    this.repo = getNestedProperty(
      settings,
      "github-address-labels.repo-name",
      null,
    );
  }

  getSettings(): {
    token: string | null;
    owner: string | null;
    repo: string | null;
  } {
    return { token: this.token, owner: this.owner, repo: this.repo };
  }

  private constructor(loadSettings: boolean) {
    if (loadSettings) {
      this.loadSettings();
    }
  }

  public static getInstance(): GitHubCustomLabelFetcher {
    if (!GitHubCustomLabelFetcher.instance) {
      GitHubCustomLabelFetcher.instance = new GitHubCustomLabelFetcher(true);
    }
    return GitHubCustomLabelFetcher.instance;
  }

  public static async getLoadedInstance(): Promise<GitHubCustomLabelFetcher> {
    if (!GitHubCustomLabelFetcher.instance) {
      GitHubCustomLabelFetcher.instance = new GitHubCustomLabelFetcher(false);
      await GitHubCustomLabelFetcher.instance.loadSettings();
    }
    return GitHubCustomLabelFetcher.instance;
  }

  async updateLabels(newItem: { [address: string]: string }) {
    if (!this.token || !this.owner || !this.repo) {
      return;
    }
    for (const [address, value] of Object.entries(newItem)) {
      let sha: string | undefined;
      const shaResp = await getRepoItem(
        this.token,
        this.owner,
        this.repo,
        address,
      );
      if (shaResp.status === 404) {
        sha = undefined;
      } else {
        const jsonRes = await shaResp.json();
        sha = jsonRes.sha;
      }
      if (!value) {
        await updateFileInRepo(
          this.owner,
          this.repo,
          address,
          null,
          this.token,
          sha,
        );
        this.fetchedLabels.set(address, null);
      } else {
        await updateFileInRepo(
          this.owner,
          this.repo,
          address,
          value,
          this.token,
          sha,
        );
        this.fetchedLabels.set(address, value);
      }
    }
  }

  async getItem(key: string): Promise<string | undefined> {
    console.log("Github:", this.token, this.owner, this.repo);
    if (!this.token || !this.owner || !this.repo) {
      return undefined;
    }
    const savedLabel = this.fetchedLabels.get(key);
    if (savedLabel !== undefined) {
      return savedLabel === null ? undefined : savedLabel!;
    }
    const fetchResult = await getRepoItem(
      this.token,
      this.owner,
      this.repo,
      key,
    );
    if (fetchResult.status === 404) {
      this.fetchedLabels.set(key, null);
      return undefined;
    } else if (fetchResult.ok) {
      const jsonContent = await fetchResult.json();
      const content = atob(jsonContent.content);
      this.fetchedLabels.set(key, content);
      return content;
    }
    // Some error when fetching
    return undefined;
  }

  async getAllAddresses(): Promise<string[]> {
    if (!this.owner || !this.repo || !this.token) {
      return [];
    }
    return getRepoFileList(this.owner, this.repo, this.token);
  }
}

async function getRepoFileList(
  owner: string,
  repo: string,
  token: string,
): Promise<string[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents`,
    {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const files = await response.json();
  return files.map((file: any) => file.name);
}

async function updateFileInRepo(
  owner: string,
  repo: string,
  path: string,
  content: string | null,
  token: string,
  sha: string | undefined,
) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: content === null ? "DELETE" : "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Update " + path,
        committer: { name: owner, email: owner },
        content: content !== null ? btoa(content) : undefined,
        sha,
      }),
    },
  );

  if (!response.ok) {
    console.error("Error:", response.status, response.statusText);
  }
}

async function getRepoItem(
  token: string,
  owner: string,
  repo: string,
  path: string,
): Promise<Response> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
    },
  );

  return response;
}

export const CustomLabelFetcher = GitHubCustomLabelFetcher;

export class CustomLabelResolver extends BasicAddressResolver {
  async resolveAddress(
    provider: JsonRpcApiProvider,
    address: string,
  ): Promise<string | undefined> {
    const labelFetcher = await GitHubCustomLabelFetcher.getLoadedInstance();
    const label = await labelFetcher.getItem(address);
    return label;
  }

  trusted(resolvedAddress: string | undefined): boolean | undefined {
    return true;
  }
}
