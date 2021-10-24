import React from "react";
import ReactDOM from "react-dom";
import { Helmet } from "react-helmet";
import "@fontsource/space-grotesk/index.css";
import "@fontsource/roboto/index.css";
import "@fontsource/roboto-mono/index.css";
import spaceGrotesk from "@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <Helmet>
      <link
        rel="preload"
        href={spaceGrotesk}
        as="font"
        type="font/woff2"
        crossOrigin="true"
      />
    </Helmet>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
