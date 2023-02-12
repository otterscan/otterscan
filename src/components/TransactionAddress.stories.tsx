import { Meta, StoryObj } from "@storybook/react";
import TransactionAddress from "./TransactionAddress";
import { RuntimeContext } from "../useRuntime";
import { AppConfigContext } from "../useAppConfig";
import StandardSelectionBoundary from "../selection/StandardSelectionBoundary";
import { AddressContext, ConnectionStatus } from "../types";
import { SourcifySource } from "../sourcify/useSourcify";
import { SelectionContext } from "../selection/useSelection";

const meta = {
  component: TransactionAddress,
  decorators: [
    (Story) => (
      <RuntimeContext.Provider
        value={{ connStatus: ConnectionStatus.CONNECTED }}
      >
        <AppConfigContext.Provider
          value={{
            sourcifySource: SourcifySource.CENTRAL_SERVER,
            setSourcifySource: () => {},
          }}
        >
          <StandardSelectionBoundary>
            <Story />
          </StandardSelectionBoundary>
        </AppConfigContext.Provider>
      </RuntimeContext.Provider>
    ),
  ],
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
