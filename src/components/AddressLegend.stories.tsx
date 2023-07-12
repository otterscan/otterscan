import type { Meta, StoryObj } from "@storybook/react";
import AddressLegend from "./AddressLegend";

const meta = {
  component: AddressLegend,
} satisfies Meta<typeof AddressLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ERC20: Story = {
  args: {
    uniqueId: "erc20",
  },
  render: (args) => <AddressLegend {...args}>[ERC20]</AddressLegend>,
};
