import { Meta, StoryObj } from "@storybook/react";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";
import { SourcifySource } from "../../sourcify/useSourcify";
import { ConnectionStatus } from "../../types";
import { AppConfigContext } from "../../useAppConfig";
import { RuntimeContext } from "../../useRuntime";
import DecodedParamsTable from "./DecodedParamsTable";
import {
  Address,
  Array,
  ArrayOfTuple,
  Boolean,
  Tuple,
  Uint256,
  Uint8,
} from "./DecodedParamRow.stories";

const meta = {
  component: DecodedParamsTable,
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
} satisfies Meta<typeof DecodedParamsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    args: [
      Uint8.args.r,
      Uint256.args.r,
      Boolean.args.r,
      Address.args.r,
      Array.args.r,
      Tuple.args.r,
      ArrayOfTuple.args.r,
    ],
    paramTypes: [
      Uint8.args.paramType,
      Uint256.args.paramType,
      Boolean.args.paramType,
      Address.args.paramType,
      Array.args.paramType,
      Tuple.args.paramType,
      ArrayOfTuple.args.paramType,
    ],
  },
};
