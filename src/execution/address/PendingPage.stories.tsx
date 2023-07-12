import { Meta, StoryObj } from "@storybook/react";
import PendingPage from "./PendingPage";
import StandardTHead from "../../components/StandardTHead";

const meta = {
  component: PendingPage,
} satisfies Meta<typeof PendingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rows: 5,
    cols: 10,
  },
  decorators: [
    (Story) => (
      <table>
        <StandardTHead>
          {[...new Array(10).keys()].map((_, i) => (
            <th className="w-40">Column {i + 1}</th>
          ))}
        </StandardTHead>
        <Story />
      </table>
    ),
  ],
};
