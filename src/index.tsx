var React = require("react");
var ReactDOM = require("react-dom");

import { LottieReact } from "./lottie";

import * as bodymovin from "./bodymovin-example.json";

const App = () => (
  <>
    <LottieReact options={{ animationData: bodymovin }} />
  </>
);

ReactDOM.render(<App />, document.getElementById("root"));
