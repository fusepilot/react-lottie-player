import * as React from "react";
import * as ReactDOM from "react-dom";

import { LottieReact } from "./lottie";
// import LottieReact from "react-lottie";
import { Global, css } from "@emotion/core";
import * as bodymovin from "./bodymovin-example.json";
import * as checked from "./checked.json";
import { useState } from "react";

const globalStyles = css`
  html {
    background: #222;
    color: white;
  }
`;

const App = () => {
  const [animation, setAnimation] = useState(checked);

  return (
    <>
      <Global styles={globalStyles} />
      <LottieReact
        options={{
          animationData: animation,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
          }
        }}
        eventListeners={[
          {
            eventName: "enterFrame",
            callback: () => console.log("enterFrame:")
          }
        ]}
      />
      <button
        onClick={() =>
          setAnimation(animation == bodymovin ? checked : bodymovin)
        }
      >
        Toggle Animation
      </button>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
