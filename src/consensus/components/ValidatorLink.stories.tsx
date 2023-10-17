import { Meta, StoryObj } from "@storybook/react";
import ValidatorLink from "./ValidatorLink";

const meta = {
  component: ValidatorLink,
} satisfies Meta<typeof ValidatorLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GenesisValidator: Story = {
  args: {
    validatorIndex: 0,
  },
};

export const RecentMainnetValidatorIndex: Story = {
  args: {
    validatorIndex: 560_000,
  },
};

export const DisabledValidatorLink: Story = {
  args: {
    validatorIndex: 560_000,
    disabled: true,
  },
};

export const SlashedValidator: Story = {
  args: {
    ...RecentMainnetValidatorIndex.args,
    slashed: true,
  },
};
