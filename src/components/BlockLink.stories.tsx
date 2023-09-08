import { Meta, StoryObj } from "@storybook/react";
import BlockLink from "./BlockLink";

const meta = {
  component: BlockLink,
} satisfies Meta<typeof BlockLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GenesisBlock: Story = {
  args: {
    blockTag: 0,
  },
};

export const BlockOneThousand: Story = {
  args: {
    blockTag: 1_000,
  },
};

export const RecentMainnetBlockNumber: Story = {
  args: {
    blockTag: 16_500_123,
  },
};

export const BigBlockNumber: Story = {
  args: {
    blockTag: 16_500_123_456,
  },
};

export const BlockHash: Story = {
  args: {
    blockTag:
      "0xf75189cac9fa1017fd7ddcacfb75e2d77ce5bd40cf2cfeff9203ec156b650a34",
  },
};
