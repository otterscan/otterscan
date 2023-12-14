import { Meta, StoryObj } from "@storybook/react";
import DisplayInteger from "./DisplayInteger";

const meta = {
  component: DisplayInteger,
} satisfies Meta<typeof DisplayInteger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const One: Story = {
  args: {
    numberStr: "1",
  },
};

export const MultipleCommas: Story = {
  args: {
    numberStr: "1234567",
  },
};

export const NegativeNumber: Story = {
  args: {
    numberStr: "-123456789",
  },
};

export const EighteenDecimals: Story = {
  args: {
    numberStr: "11000000000000000000",
  },
};
