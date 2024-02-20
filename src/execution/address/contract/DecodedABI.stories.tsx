import { Meta, StoryObj } from "@storybook/react";
import erc20 from "../../../abi/erc20.json";
import DecodedABI from "./DecodedABI";

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
