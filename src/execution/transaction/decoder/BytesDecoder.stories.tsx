import { Meta, StoryObj } from "@storybook/react";
import BytesDecoder from "./BytesDecoder";

const meta = {
  component: BytesDecoder,
} satisfies Meta<typeof BytesDecoder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    r: "0x",
  },
};

export const OneByte: Story = {
  args: {
    r: "0x01",
  },
};

export const EightBytes: Story = {
  args: {
    r: "0x0102030405060708",
  },
};
