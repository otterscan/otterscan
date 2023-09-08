import { Meta, StoryObj } from "@storybook/react";
import { EventFragment } from "ethers";
import DecodedLogSignature from "./DecodedLogSignature";

const meta = {
  component: DecodedLogSignature,
} satisfies Meta<typeof DecodedLogSignature>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ERC20Transfer: Story = {
  args: {
    event: EventFragment.from(
      "Transfer(address from, address to, uint256 amount)"
    ),
  },
};

export const Numbers: Story = {
  args: {
    event: EventFragment.from("DummyEvent(uint256 a)"),
  },
};

export const Test: Story = {
  args: {
    event: EventFragment.from(
      "OrderFulfilled(bytes32 orderHash, address indexed offerer, address indexed zone, address recipient, tuple(uint8 itemType, address token, uint256 identifier, uint256 amount)[] offer, tuple(uint8 itemType, address token, uint256 identifier, uint256 amount, address recipient)[] consideration)"
    ),
  },
};
