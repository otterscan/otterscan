import "@fontsource/fira-code/index.css";
import "@fontsource/roboto-mono/index.css";
import "@fontsource/roboto/index.css";
import spaceGrotesk from "@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2";
import "@fontsource/space-grotesk/index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { Helmet, HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
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
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
