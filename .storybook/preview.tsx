import "@fontsource/fira-code/index.css";
import "@fontsource/roboto-mono/index.css";
import "@fontsource/roboto/index.css";
import "@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2";
import "@fontsource/space-grotesk/index.css";
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
import { Decorator } from "@storybook/react";
import { BrowserRouter as Router } from "react-router-dom";
import "../src/index.css";

export const parameters = {
  backgrounds: {
    default: "light",
  },
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
};

export const decorators: Decorator[] = [
  (Story) => (
    <Router>
      <Story />
    </Router>
  ),
];
