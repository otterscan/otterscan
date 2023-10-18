import { Meta, StoryObj } from "@storybook/react";
import ParamDeclaration from "./ParamDeclaration";
import { ParamType } from "ethers";

const meta = {
  component: ParamDeclaration,
} satisfies Meta<typeof ParamDeclaration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Address: Story = {
  args: {
    input: ParamType.from("address a"),
  },
};

export const Bytes32: Story = {
  args: {
    input: ParamType.from("bytes32 data"),
  },
};
