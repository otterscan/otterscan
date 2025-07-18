import { type Decorator } from "@storybook/react-vite";
import { JsonRpcProvider } from "ethers";
import StandardSelectionBoundary from "../selection/StandardSelectionBoundary";
import { defaultSourcifySourceName } from "../sourcify/useSourcify";
import { AppConfigContext } from "../useAppConfig";
import { OtterscanConfig } from "../useConfig";
import { RuntimeContext } from "../useRuntime";

const mockConfig: OtterscanConfig = {};

// Mock ETH node at localhost@4242; with mock chain ID 424242
const mockProvider: JsonRpcProvider = new JsonRpcProvider(
  "http://127.0.0.1:4242",
  424242,
  {
    staticNetwork: true,
  },
);

export const runtimeDecorator: Decorator<unknown> = (Story) => (
  <RuntimeContext.Provider
    value={{ config: mockConfig, provider: mockProvider }}
  >
    <AppConfigContext.Provider
      value={{
        sourcifySource: defaultSourcifySourceName,
        setSourcifySource: () => {},
      }}
    >
      <StandardSelectionBoundary>
        <Story />
      </StandardSelectionBoundary>
    </AppConfigContext.Provider>
  </RuntimeContext.Provider>
);
