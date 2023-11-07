import { Tab } from "@headlessui/react";
import { Meta, StoryObj } from "@storybook/react";
import ModeTab from "./ModeTab";

const meta = {
  component: ModeTab,
  decorators: [
    (Story) => (
      <Tab.Group>
        <Story />
      </Tab.Group>
    ),
  ],
} satisfies Meta<typeof ModeTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Press me",
  },
};

export const Disabled: Story = {
  args: {
    children: "Can't press me :(",
    disabled: true,
  },
};
