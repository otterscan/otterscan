import { Meta, StoryObj } from "@storybook/react";
import { ParamType } from "ethers";
import ParamDeclaration from "./ParamDeclaration";

const meta = {
  component: ParamDeclaration,
} satisfies Meta<typeof ParamDeclaration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Address: Story = {
  args: {
    input: ParamType.from("address a"),
    index: 0,
  },
};

export const Bytes32: Story = {
  args: {
    ...Address.args,
    input: ParamType.from("bytes32 data"),
  },
};

export const UnnamedParam: Story = {
  args: {
    ...Address.args,
    input: ParamType.from("address"),
  },
};

export const OrderTuple: Story = {
  args: {
    ...Address.args,
    input: ParamType.from(
      "tuple(uint256 info, address makerAsset, address takerAsset, address maker, address allowedSender, uint256 makingAmount, uint256 takingAmount) order",
    ),
  },
};
