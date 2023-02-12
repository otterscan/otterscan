import { Meta, StoryObj } from "@storybook/react";
import PlainAddress from "./PlainAddress";

const meta = {
  component: PlainAddress,
} satisfies Meta<typeof PlainAddress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleAddress: Story = {
  args: {
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    linkable: true,
    dontOverrideColors: true,
  },
};
