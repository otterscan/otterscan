import { Meta, StoryObj } from "@storybook/react";
import erc20 from "../../../abi/erc20.json";
import ContractABI from "./ContractABI";

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
