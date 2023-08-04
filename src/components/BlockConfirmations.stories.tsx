import { Meta, StoryObj } from "@storybook/react";
import BlockConfirmations from "./BlockConfirmations";

const meta = {
  component: BlockConfirmations,
} satisfies Meta<typeof BlockConfirmations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneConfirmation: Story = {
  args: {
    confirmations: 1,
  },
};

export const LotsOfConfirmations: Story = {
  args: {
    confirmations: 123_456,
  },
};
