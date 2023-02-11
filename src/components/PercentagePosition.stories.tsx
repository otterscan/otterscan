import { Meta, StoryObj } from "@storybook/react";
import PercentagePosition from "./PercentagePosition";

const meta = {
  component: PercentagePosition,
} satisfies Meta<typeof PercentagePosition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const First: Story = {
  args: {
    perc: 0,
  },
};

export const Middle: Story = {
  args: {
    perc: 0.5,
  },
};

export const Last: Story = {
  args: {
    perc: 1,
  },
};
