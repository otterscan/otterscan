export type ContractFilter = {
  url: string;
  label: string;
};

export const contractFilters: ContractFilter[] = [
  {
    url: "/contracts",
    label: "All contracts",
  },
  {
    url: "/contracts/erc20",
    label: "ERC20 tokens",
  },
  {
    url: "/contracts/erc4626",
    label: "ERC4626 vaults",
  },
  {
    url: "/contracts/erc721",
    label: "ERC721 tokens",
  },
  {
    url: "/contracts/erc1155",
    label: "ERC1155 tokens",
  },
  {
    url: "/contracts/erc1167",
    label: "ERC1167 proxies",
  },
];
