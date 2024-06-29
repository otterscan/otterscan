import { Meta, StoryObj } from "@storybook/react";
import Accordion from "./Accordion";

const meta = {
  component: Accordion,
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExampleAccordion: Story = {
  args: {
    title: "Example accordion",
    children: <>Accordion content here</>,
  },
};
