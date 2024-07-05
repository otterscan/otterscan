import { Meta, StoryObj } from "@storybook/react";
import { Result } from "ethers";
import { runtimeDecorator } from "../../../storybook/util";
import {
  AddressWithHelp,
  ArrayOfTupleWithHelp,
  ArrayWithHelp,
  BooleanWithHelp,
  TupleWithHelp,
  Uint256WithHelp,
  Uint8WithHelp,
} from "./DecodedParamRow.stories";
import DecodedParamsTable from "./DecodedParamsTable";

const meta = {
  component: DecodedParamsTable,
  decorators: [runtimeDecorator],
} satisfies Meta<typeof DecodedParamsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    args: Result.fromItems([
      Uint8WithHelp.args.r,
      Uint256WithHelp.args.r,
      BooleanWithHelp.args.r,
      AddressWithHelp.args.r,
      ArrayWithHelp.args.r,
      TupleWithHelp.args.r,
      ArrayOfTupleWithHelp.args.r,
    ]),
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
