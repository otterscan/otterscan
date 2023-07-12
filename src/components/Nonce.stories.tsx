import { Meta, StoryObj } from "@storybook/react";
import Nonce from "./Nonce";

const meta = {
  component: Nonce,
} satisfies Meta<typeof Nonce>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NeverSent: Story = {
  args: {
    value: 0,
  },
};

export const BigNonce: Story = {
  args: {
    value: 1_000,
  },
};

export const ProbablyBot: Story = {
  args: {
    value: 1_234_567,
  },
};
