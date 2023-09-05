import { Meta, StoryObj } from "@storybook/react";
import FormattedBalance from "./FormattedBalance";

const meta = {
  component: FormattedBalance,
} satisfies Meta<typeof FormattedBalance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Zero: Story = {
  args: {
    value: 0n,
  },
};

export const OneGweiAsEther: Story = {
  args: {
    value: 1000000000n,
  },
};

export const OneGweiWithSymbol: Story = {
  args: {
    ...OneGweiAsEther.args,
    decimals: 9,
    symbol: "gwei",
  },
};

export const OneEther: Story = {
  args: {
    value: 1000000000000000000n,
  },
};

export const OneEtherWithSymbol: Story = {
  args: {
    ...OneEther.args,
    symbol: "ETH",
  },
};

export const OneMillionEther: Story = {
  args: {
    value: 1000000000000000000000000n,
    symbol: "ETH",
  },
};
