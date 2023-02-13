import { Meta, StoryObj } from "@storybook/react";
import DecodedABI from "./DecodedABI";
import erc20 from "../../erc20.json";

const meta = {
  component: DecodedABI,
} satisfies Meta<typeof DecodedABI>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ERC20: Story = {
  args: {
    abi: erc20,
  },
};
