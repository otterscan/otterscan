import { Meta, StoryObj } from "@storybook/react";
import HelpButton from "./HelpButton";

const meta = {
  component: HelpButton,
} satisfies Meta<typeof HelpButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: {
    checked: false,
    onChange: (newValue: boolean) => {},
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    onChange: (newValue: boolean) => {},
  },
};
