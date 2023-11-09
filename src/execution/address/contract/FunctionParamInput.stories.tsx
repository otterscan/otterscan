import { Meta, StoryObj } from "@storybook/react";
import { ParamType } from "ethers";
import FunctionParamInput from "./FunctionParamInput";

const meta = {
  component: FunctionParamInput,
} satisfies Meta<typeof FunctionParamInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Address: Story = {
  args: {
    param: ParamType.from("address _to"),
  },
};

export const Uint: Story = {
  args: {
    param: ParamType.from("uint _value"),
  },
};

export const StringArrayFixed: Story = {
  args: {
    param: ParamType.from("string[2][3] strings"),
  },
};

export const UintArray: Story = {
  args: {
    param: ParamType.from("uint256[] values"),
  },
};

export const Tuple: Story = {
  args: {
    param: ParamType.from(
      "tuple(address rewardToken, address pool, uint256 startTime, uint256 endTime, address refundee) key",
    ),
  },
};

export const TupleArray: Story = {
  args: {
    param: ParamType.from(
      "tuple(address destination, uint256 value, uint256 expiry, bytes32 sig)[]",
    ),
  },
};
