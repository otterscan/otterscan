import { Meta, StoryObj } from "@storybook/react";
import BooleanDecoder from "./BooleanDecoder";

const meta = {
  component: BooleanDecoder,
} satisfies Meta<typeof BooleanDecoder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const True: Story = {
  args: {
    r: true,
  },
};

export const False: Story = {
  args: {
    r: false,
  },
};
