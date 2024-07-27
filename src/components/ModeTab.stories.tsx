import { TabGroup } from "@headlessui/react";
import { Meta, StoryObj } from "@storybook/react";
import ModeTab from "./ModeTab";

const meta = {
  component: ModeTab,
  decorators: [
    (Story) => (
      <TabGroup>
        <Story />
      </TabGroup>
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
