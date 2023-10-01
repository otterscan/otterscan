import { Meta, StoryObj } from "@storybook/react";
import PendingItem from "./PendingItem";

const meta = {
  component: PendingItem,
} satisfies Meta<typeof PendingItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
