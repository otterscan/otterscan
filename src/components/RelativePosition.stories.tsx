import { Meta, StoryObj } from "@storybook/react";
import RelativePosition from "./RelativePosition";

const meta = {
  component: RelativePosition,
} satisfies Meta<typeof RelativePosition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    pos: 20,
    total: 50,
  },
};
