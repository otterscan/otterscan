import { Meta, StoryObj } from "@storybook/react";
import erc20 from "../../../abi/erc20.json";
import RawABI from "./RawABI";

const meta = {
  component: RawABI,
} satisfies Meta<typeof RawABI>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ERC20: Story = {
  args: {
    abi: erc20,
  },
};
