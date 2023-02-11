import { Meta, StoryObj } from "@storybook/react";
import ExternalLink from "./ExternalLink";

const meta = {
  component: ExternalLink,
} satisfies Meta<typeof ExternalLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleLink: Story = {
  args: {
    href: "https://otterscan.io",
  },
  render: (args) => <ExternalLink {...args}>Otterscan website</ExternalLink>,
};
