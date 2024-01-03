import { Meta, StoryObj } from "@storybook/react";
import LabeledSwitch from "./LabeledSwitch";

const meta = {
  component: LabeledSwitch,
} satisfies Meta<typeof LabeledSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Enabled: Story = {
  args: {
    defaultEnabled: true,
    onToggle: (newValue: boolean) => {},
  },
};

export const Disabled: Story = {
  args: {
    defaultEnabled: false,
    onToggle: (newValue: boolean) => {},
  },
};
