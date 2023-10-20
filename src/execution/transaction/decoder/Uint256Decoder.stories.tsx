import { Meta, StoryObj } from "@storybook/react";
import Uint256Decoder from "./Uint256Decoder";

const meta = {
  component: Uint256Decoder,
} satisfies Meta<typeof Uint256Decoder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Zero: Story = {
  args: {
    r: 0n,
  },
};

export const Max: Story = {
  args: {
    r: BigInt(
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    ),
  },
};
