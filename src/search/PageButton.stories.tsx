import { Meta, StoryObj } from "@storybook/react";
import PageButton from "./PageButton";

const meta = {
  component: PageButton,
} satisfies Meta<typeof PageButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    goToPage: 5,
    children: <>5</>,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};
