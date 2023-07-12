import { Meta, StoryObj } from "@storybook/react";
import EpochLink from "./EpochLink";

const meta = {
  component: EpochLink,
} satisfies Meta<typeof EpochLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GenesisEpoch: Story = {
  args: {
    epochNumber: 0,
  },
};

export const RecentMainnetEpoch: Story = {
  args: {
    epochNumber: 180_500,
  },
};

export const BigEpochNumber: Story = {
  args: {
    epochNumber: 1_200_200,
  },
};
