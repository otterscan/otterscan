import { Meta, StoryObj } from "@storybook/react";
import PercentageGauge from "./PercentageGauge";

const meta = {
  component: PercentageGauge,
} satisfies Meta<typeof PercentageGauge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Zero: Story = {
  args: {
    perc: 0,
    bgColor: "bg-gray-300",
    bgColorPerc: "bg-gray-700",
    textColor: "bg-gray-700",
  },
};

export const Fifty: Story = {
  args: {
    ...Zero.args,
    perc: 50,
  },
};

export const OneHundred: Story = {
  args: {
    ...Zero.args,
    perc: 100,
  },
};
