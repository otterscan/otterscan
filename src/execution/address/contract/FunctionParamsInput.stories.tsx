import { Meta, StoryObj } from "@storybook/react";
import { Interface } from "ethers";
import FunctionParamsInput from "./FunctionParamsInput";

const meta = {
  component: FunctionParamsInput,
} satisfies Meta<typeof FunctionParamsInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeArgs = (fragment: string) => {
  const intf = new Interface([fragment]);
  return {
    params: intf.fragments[0].inputs,
    inputCallback: (values: string[]) => {},
  };
};

export const Constructor: Story = {
  args: {
    ...makeArgs("constructor(uint _data) public"),
  },
};

export const AddressUint: Story = {
  args: {
    ...makeArgs(
      "function transfer(address _to, uint256 _value) public returns (bool success)",
    ),
  },
};

export const UintArray: Story = {
  args: {
    ...makeArgs(
      "function processValues(uint256[] values) public returns (bool success)",
    ),
  },
};

export const TupleType: Story = {
  args: {
    ...makeArgs(
      "function getRewardInfo(tuple(address rewardToken, address pool, uint256 startTime, uint256 endTime, address refundee) key, uint256 tokenId) view returns (uint256 reward, uint160 secondsInsideX128)",
    ),
  },
};

export const TupleArray: Story = {
  args: {
    ...makeArgs(
      "function sendFunds(tuple(address destination, uint256 value, uint256 expiry, bytes32 sig)[] sends) public",
    ),
  },
};
