import { Meta, StoryObj } from "@storybook/react";
import StandardSelectionBoundary from "../../../selection/StandardSelectionBoundary";
import { SourcifySource } from "../../../sourcify/useSourcify";
import { ConnectionStatus } from "../../../types";
import { AppConfigContext } from "../../../useAppConfig";
import { RuntimeContext } from "../../../useRuntime";
import DecodedParamsTable from "./DecodedParamsTable";
import {
  AddressWithHelp,
  ArrayOfTupleWithHelp,
  ArrayWithHelp,
  BooleanWithHelp,
  TupleWithHelp,
  Uint256WithHelp,
  Uint8WithHelp,
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
      Uint8WithHelp.args.r,
      Uint256WithHelp.args.r,
      BooleanWithHelp.args.r,
      AddressWithHelp.args.r,
      ArrayWithHelp.args.r,
      TupleWithHelp.args.r,
      ArrayOfTupleWithHelp.args.r,
    ],
    paramTypes: [
      Uint8WithHelp.args.paramType,
      Uint256WithHelp.args.paramType,
      BooleanWithHelp.args.paramType,
      AddressWithHelp.args.paramType,
      ArrayWithHelp.args.paramType,
      TupleWithHelp.args.paramType,
      ArrayOfTupleWithHelp.args.paramType,
    ],
  },
};

export const WithoutParamNames: Story = {
  args: {
    ...Default.args,
    hasParamNames: false,
  },
};
