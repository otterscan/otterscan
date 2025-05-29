import "@fontsource/fira-code/index.css";
import "@fontsource/roboto-mono/index.css";
import "@fontsource/roboto/index.css";
import spaceGrotesk from "@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2";
import "@fontsource/space-grotesk/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { HydratedRouter } from "react-router/dom";
import "./index.css";

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HelmetProvider>
      <Helmet>
        <link rel="preload" href={spaceGrotesk} as="font" type="font/woff2" />
        <script>
          {`if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }`}
        </script>
      </Helmet>
      <HydratedRouter />
    </HelmetProvider>
  </React.StrictMode>,
);
