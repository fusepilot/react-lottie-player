import * as React from "react";
import * as ReactDOM from "react-dom";

import { LottieReact } from "./lottie";
import { Global, css } from "@emotion/core";
import * as bodymovin from "./bodymovin-example.json";

const globalStyles = css`
  html {
    background: #222;
    color: white;
  }
`;

const App = () => (
  <>
    <Global styles={globalStyles} />
    <LottieReact options={{ animationData: bodymovin }} />
  </>
);

ReactDOM.render(<App />, document.getElementById("root"));
