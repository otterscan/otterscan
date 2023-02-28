import { Meta, StoryObj } from "@storybook/react";
import Topic from "./Topic";

const meta = {
  component: Topic,
} satisfies Meta<typeof Topic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Transfer: Story = {
  args: {
    idx: 0,
    data: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  },
};

export const From: Story = {
  args: {
    idx: 1,
    data: "0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045",
  },
};

export const To: Story = {
  args: {
    idx: 2,
    data: "0x0000000000000000000000000000000000000000000000000000000000000000",
  },
};
