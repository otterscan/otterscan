import { Meta, StoryObj } from "@storybook/react";
import { runtimeDecorator } from "../../../storybook/util";
import AddressDecoder from "./AddressDecoder";

const meta = {
  component: AddressDecoder,
  decorators: [runtimeDecorator],
} satisfies Meta<typeof AddressDecoder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlainAddress: Story = {
  args: {
    r: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  },
};
