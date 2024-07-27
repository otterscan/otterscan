import { Meta, StoryObj } from "@storybook/react";
import { SelectionContext } from "../../selection/useSelection";
import { runtimeDecorator } from "../../storybook/util";
import { AddressContext } from "../../types";
import TransactionAddress from "./TransactionAddress";

const meta = {
  component: TransactionAddress,
  decorators: [runtimeDecorator],
} satisfies Meta<typeof TransactionAddress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  },
};

export const Hovered: Story = {
  args: {
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  },
  decorators: [
    (Story) => (
      <SelectionContext.Provider
        value={[
          {
            type: "address",
            content: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          },
          () => {},
        ]}
      >
        <Story />
      </SelectionContext.Provider>
    ),
  ],
};

export const Selected: Story = {
  args: {
    ...Default.args,
    selectedAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  },
};

export const Creation: Story = {
  args: {
    ...Default.args,
    creation: true,
  },
};

export const Miner: Story = {
  args: {
    ...Default.args,
    miner: true,
  },
};

export const From: Story = {
  args: {
    ...Default.args,
    addressCtx: AddressContext.FROM,
  },
};
