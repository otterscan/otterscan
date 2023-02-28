import { Meta, StoryObj } from "@storybook/react";
import NavBlock from "./NavBlock";

const meta = {
  component: NavBlock,
} satisfies Meta<typeof NavBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    entityNum: 5,
    latestEntityNum: 100,
    urlBuilder: (_) => "",
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    entityNum: 0,
    latestEntityNum: 0,
  },
};

export const First: Story = {
  args: {
    ...Default.args,
    entityNum: 0,
    latestEntityNum: 100,
  },
};

export const Last: Story = {
  args: {
    ...Default.args,
    entityNum: 100,
    latestEntityNum: 100,
  },
};
