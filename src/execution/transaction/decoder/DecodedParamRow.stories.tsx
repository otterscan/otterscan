import { Meta, StoryObj } from "@storybook/react";
import { ParamType } from "ethers";
import DecodedParamRow from "./DecodedParamRow";
import { RuntimeContext } from "../../../useRuntime";
import { ConnectionStatus } from "../../../types";
import { AppConfigContext } from "../../../useAppConfig";
import { SourcifySource } from "../../../sourcify/useSourcify";
import StandardSelectionBoundary from "../../../selection/StandardSelectionBoundary";

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
    paramType: ParamType.from("uint8 uint8ParamName"),
    r: "42",
  },
};

export const Uint8WithHelp: Story = {
  args: {
    ...Uint8.args,
    help: "Help for uint8 param",
  },
};

export const Uint256: Story = {
  args: {
    paramType: ParamType.from("uint256 uint256ParamName"),
    r: "42",
  },
};

export const Uint256WithHelp: Story = {
  args: {
    ...Uint256.args,
    help: "Help for uint256 param",
  },
};

export const Boolean: Story = {
  args: {
    paramType: ParamType.from("bool boolParamName"),
    r: true,
  },
};

export const BooleanWithHelp: Story = {
  args: {
    ...Boolean.args,
    help: "Help for bool param",
  },
};

export const Address: Story = {
  args: {
    paramType: ParamType.from("address addrParamName"),
    r: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  },
};

export const AddressWithHelp: Story = {
  args: {
    ...Address.args,
    help: "Help for address param",
  },
};

export const Array: Story = {
  args: {
    paramType: ParamType.from("uint256[] arrayParamName"),
    r: [1, 2, 3],
  },
};

export const ArrayWithHelp: Story = {
  args: {
    ...Array.args,
    help: "Help for array param",
  },
};

export const Tuple: Story = {
  args: {
    paramType: ParamType.from("tuple(uint8, bool, uint256) tupleParamName"),
    r: [1, true, 42],
  },
};

export const TupleWithHelp: Story = {
  args: {
    ...Tuple.args,
    help: "Help for tuple param",
  },
};

export const ArrayOfTuple: Story = {
  args: {
    paramType: ParamType.from(
      "tuple(uint8, bool, uint256)[] arrTupleParamName",
    ),
    r: [
      [1, true, 42],
      [2, false, 41],
    ],
  },
};

export const ArrayOfTupleWithHelp: Story = {
  args: {
    ...ArrayOfTuple.args,
    help: "Help for array of tuple param",
  },
};

export const UnnamedTupleReturnValue: Story = {
  args: {
    paramType: ParamType.from("tuple(uint8,bool,uint256[])"),
    r: [23, false, [34, 45, 56]],
    defaultNameBase: "ret",
  },
};
