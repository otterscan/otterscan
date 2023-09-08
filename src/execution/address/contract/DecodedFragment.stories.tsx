import { Meta, StoryObj } from "@storybook/react";
import { Interface } from "ethers";
import DecodedFragment from "./DecodedFragment";

const meta = {
  component: DecodedFragment,
} satisfies Meta<typeof DecodedFragment>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeArgs = (fragment: string) => {
  const intf = new Interface([fragment]);
  return {
    intf,
    fragment: intf.fragments[0],
  };
};

export const Constructor: Story = {
  args: {
    ...makeArgs("constructor(uint _data) public"),
  },
};

export const Function: Story = {
  args: {
    ...makeArgs(
      "function transfer(address _to, uint256 _value) public returns (bool success)"
    ),
  },
};

export const Event: Story = {
  args: {
    ...makeArgs(
      "event Transfer(address indexed _from, address indexed _to, uint256 _value)"
    ),
  },
};
