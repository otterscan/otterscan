import { Meta, StoryObj } from "@storybook/react";
import { ParamType } from "@ethersproject/abi";
import DecodedParamRow from "./DecodedParamRow";
import { RuntimeContext } from "../../useRuntime";
import { ConnectionStatus } from "../../types";
import { AppConfigContext } from "../../useAppConfig";
import { SourcifySource } from "../../sourcify/useSourcify";
import StandardSelectionBoundary from "../../selection/StandardSelectionBoundary";

const meta = {
  component: DecodedParamRow,
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
} satisfies Meta<typeof DecodedParamRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Uint8: Story = {
  args: {
    paramType: ParamType.from("uint8 paramName"),
    r: "42",
  },
};

export const Uint256: Story = {
  args: {
    paramType: ParamType.from("uint256 paramName"),
    r: "42",
  },
};

export const Boolean: Story = {
  args: {
    paramType: ParamType.from("bool paramName"),
    r: true,
  },
};

export const Address: Story = {
  args: {
    paramType: ParamType.from("address paramName"),
    r: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  },
};

export const Array: Story = {
  args: {
    paramType: ParamType.from("uint256[] paramName"),
    r: [1, 2, 3],
  },
};

export const Tuple: Story = {
  args: {
    paramType: ParamType.from("tuple(uint8, bool, uint256) paramName"),
    r: [1, true, 42],
  },
};

export const ArrayOfTuple: Story = {
  args: {
    paramType: ParamType.from("tuple(uint8, bool, uint256)[] paramName"),
    r: [
      [1, true, 42],
      [2, false, 41],
    ],
  },
};
