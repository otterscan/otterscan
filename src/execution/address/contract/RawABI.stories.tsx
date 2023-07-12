import { Meta, StoryObj } from "@storybook/react";
import RawABI from "./RawABI";
import erc20 from "../../../erc20.json";

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
