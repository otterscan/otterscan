import { Meta, StoryObj } from "@storybook/react";
import ErrorFallback from "./ErrorFallback";

const meta = {
  component: ErrorFallback,
} satisfies Meta<typeof ErrorFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExampleError: Story = {
  args: {
    error: new Error("Example error"),
  },
};
