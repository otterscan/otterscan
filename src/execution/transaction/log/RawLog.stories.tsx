import { Meta, StoryObj } from "@storybook/react";
import RawLog from "./RawLog";
import { From, To, Transfer } from "./Topic.stories";

const meta = {
  component: RawLog,
} satisfies Meta<typeof RawLog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    topics: [Transfer.args.data, From.args.data, To.args.data],
    data: "0x0102030405060708090a0b0c0d0e0f",
  },
};
