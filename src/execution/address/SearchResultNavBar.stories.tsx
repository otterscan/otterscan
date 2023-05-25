import { Meta, StoryObj } from "@storybook/react";
import SearchResultNavBar from "./SearchResultNavBar";

const meta = {
  component: SearchResultNavBar,
} satisfies Meta<typeof SearchResultNavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    pageNumber: 1,
    pageSize: 25,
    total: 100,
    totalFormatter: (total) => `Total results: ${total}`,
  },
};

export const Pending: Story = {
  args: {
    ...Default.args,
    total: undefined,
  },
};

export const SingleResult: Story = {
  args: {
    ...Default.args,
    total: 1,
  },
};
