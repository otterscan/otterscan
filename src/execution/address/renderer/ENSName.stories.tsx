import { Meta, StoryObj } from "@storybook/react";
import ENSName from "./ENSName";

const meta = {
  component: ENSName,
} satisfies Meta<typeof ENSName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "vitalik.eth",
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    linkable: false,
    dontOverrideColors: false,
  },
};

export const Linkable: Story = {
  args: {
    ...Default.args,
    linkable: true,
  },
};

export const LongName: Story = {
  args: {
    ...Default.args,
    name: "longlonglonglonglonglonglonglonglongname.eth",
  },
};
