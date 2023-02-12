import { Meta, StoryObj } from "@storybook/react";
import SlotLink from "./SlotLink";

const meta = {
  component: SlotLink,
} satisfies Meta<typeof SlotLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GenesisSlot: Story = {
  args: {
    slotNumber: 0,
  },
};

export const RecentMainnetSlotNumber: Story = {
  args: {
    slotNumber: 5_700_000,
  },
};

export const BigSlotNumber: Story = {
  args: {
    slotNumber: 5_700_000_000,
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
