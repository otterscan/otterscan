import { Meta, StoryObj } from "@storybook/react";
import SlotLink from "./SlotLink";

const meta = {
  component: SlotLink,
} satisfies Meta<typeof SlotLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GenesisSlot: Story = {
  args: {
    slot: 0,
  },
};

export const RecentMainnetSlotNumber: Story = {
  args: {
    slot: 5_700_000,
  },
};

export const BigSlotNumber: Story = {
  args: {
    slot: 5_700_000_000,
  },
};

export const MissedSlot: Story = {
  args: {
    ...RecentMainnetSlotNumber.args,
    missed: true,
  },
};

export const FutureScheduleSlot: Story = {
  args: {
    ...RecentMainnetSlotNumber.args,
    scheduled: true,
  },
};

export const SlotContainingSlashing: Story = {
  args: {
    ...RecentMainnetSlotNumber.args,
    slashings: true,
  },
};

export const BlockRoot: Story = {
  args: {
    slot: "0x1baac88e41f597e21a780e89dfe7add5da50e522ee4b535e7799995d807ad743",
  },
};
