import { Meta, StoryObj } from "@storybook/react";
import PlainString from "./PlainString";

const meta = {
  component: PlainString,
} satisfies Meta<typeof PlainString>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    name: "Vitalik's address",
    linkable: false,
    dontOverrideColors: false,
  },
};

export const Linkable: Story = {
  args: {
    ...Default.args,
    linkable: true,
  },
};
