import { Meta, StoryObj } from "@storybook/react";
import { BigNumber } from "@ethersproject/bignumber";
import FormattedBalance from "./FormattedBalance";

const meta = {
  component: FormattedBalance,
} satisfies Meta<typeof FormattedBalance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Zero: Story = {
  args: {
    value: BigNumber.from(0),
  },
};

export const OneGweiAsEther: Story = {
  args: {
    value: BigNumber.from("1000000000"),
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
    value: BigNumber.from("1000000000000000000"),
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
    value: BigNumber.from("1000000000000000000000000"),
    symbol: "ETH",
  },
};
