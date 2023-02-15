import { Meta, StoryObj } from "@storybook/react";
import LogIndex from "./LogIndex";

const meta = {
  component: LogIndex,
} satisfies Meta<typeof LogIndex>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Zero: Story = {
  args: {
    idx: 0,
  },
};

export const ThreeDigits: Story = {
  args: {
    idx: 242,
  },
};
