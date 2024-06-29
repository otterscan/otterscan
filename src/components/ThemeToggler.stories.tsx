import { Meta, StoryObj } from "@storybook/react";
import ThemeToggler from "./ThemeToggler";

const meta = {
  component: ThemeToggler,
} satisfies Meta<typeof ThemeToggler>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
