import { Meta, StoryObj } from "@storybook/react";
import StandardSelectionBoundary from "../../../selection/StandardSelectionBoundary";
import { SourcifySource } from "../../../sourcify/useSourcify";
import { AppConfigContext } from "../../../useAppConfig";
import { RuntimeContext } from "../../../useRuntime";
import AddressDecoder from "./AddressDecoder";

const meta = {
  component: AddressDecoder,
  decorators: [
    (Story) => (
      <RuntimeContext.Provider value={{}}>
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
} satisfies Meta<typeof AddressDecoder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlainAddress: Story = {
  args: {
    r: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  },
};
