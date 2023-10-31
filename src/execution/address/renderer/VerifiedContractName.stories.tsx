import { Meta, StoryObj } from "@storybook/react";
import VerifiedContractName from "./VerifiedContractName";

const meta = {
  component: VerifiedContractName,
} satisfies Meta<typeof VerifiedContractName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    chainId: 1n,
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    linkable: false,
    resolvedName: "WETH9",
    dontOverrideColors: false,
  },
};

export const Linkable: Story = {
  args: {
    ...Default.args,
    linkable: true,
  },
};

export const LongName: Story = {
  args: {
    ...Default.args,
    resolvedName: "UniswapV2FeeOnTransferAdapterTransparentUpgradeableProxy",
  },
};
