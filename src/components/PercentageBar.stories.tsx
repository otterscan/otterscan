import { Meta, StoryObj } from "@storybook/react";
import PercentageBar from "./PercentageBar";

const meta = {
  component: PercentageBar,
} satisfies Meta<typeof PercentageBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Zero: Story = {
  args: {
    perc: 0,
  },
};

export const Fifty: Story = {
  args: {
    perc: 50,
  },
};

export const OneHundred: Story = {
  args: {
    perc: 100,
  },
};
