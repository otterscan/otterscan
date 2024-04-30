import { Meta, StoryObj } from "@storybook/react";
import TransactionLink from "./TransactionLink";

const meta = {
  component: TransactionLink,
} satisfies Meta<typeof TransactionLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleTx: Story = {
  args: {
    txHash:
      "0x91298d449f193df13d1ba23e6ea55e9f50b88b4fb9b373571b8cb33a07c2f879",
  },
};

export const FailedTx: Story = {
  args: {
    ...SimpleTx.args,
    fail: true,
  },
};

export const BlobTx: Story = {
  args: {
    ...SimpleTx.args,
    blob: true,
  },
};

export const DepositTx: Story = {
  args: {
    ...SimpleTx.args,
    deposit: true,
  },
};
