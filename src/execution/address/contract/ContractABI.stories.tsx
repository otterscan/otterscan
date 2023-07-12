import { Meta, StoryObj } from "@storybook/react";
import ContractABI from "./ContractABI";
import erc20 from "../../../erc20.json";

const meta = {
  component: ContractABI,
} satisfies Meta<typeof ContractABI>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ERC20: Story = {
  args: {
    abi: erc20,
  },
};
