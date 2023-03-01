import { Meta, StoryObj } from "@storybook/react";
import PageControl from "./PageControl";

const meta = {
  component: PageControl,
} satisfies Meta<typeof PageControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    pageNumber: 2,
    pageSize: 25,
    total: 100,
  },
};

export const First: Story = {
  args: {
    pageNumber: 1,
    pageSize: 25,
    total: 100,
  },
};

export const Last: Story = {
  args: {
    pageNumber: 4,
    pageSize: 25,
    total: 100,
  },
};
