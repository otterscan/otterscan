import "@fontsource/fira-code/index.css";
import "@fontsource/roboto-mono/index.css";
import "@fontsource/roboto/index.css";
import "@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2";
import "@fontsource/space-grotesk/index.css";
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
import { Decorator } from "@storybook/react";
import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
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
  (Story) => {
    const router = createBrowserRouter(createRoutesFromElements(<Route path="*" element={<Story />}/>));
    return <RouterProvider router={router} />;
  },
];
