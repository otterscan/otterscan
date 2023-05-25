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
  },
};

export const Pending: Story = {
  args: {
    pageNumber: 0,
    pageSize: 25,
    total: undefined,
  },
};

export const SingleResult: Story = {
  args: {
    pageNumber: 1,
    pageSize: 25,
    total: 1,
  },
};
