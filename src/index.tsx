import * as React from "react";
import * as ReactDOM from "react-dom";

import { Lottie } from "./lottie";
import { Global, css } from "@emotion/core";
//@ts-ignore
import * as bodymovin from "./bodymovin-example.json";
//@ts-ignore
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
  const [loop, setLoop] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <Global styles={globalStyles} />
      <Lottie
        options={{ animationData: animation }}
        loop={loop}
        isPlaying={isPlaying}
      />
      <button
        onClick={() =>
          setAnimation(animation == bodymovin ? checked : bodymovin)
        }
      >
        Toggle Animation
      </button>
      <button onClick={() => setLoop(!loop)}>Toggle Loop</button>
      <button onClick={() => setIsPlaying(true)}>Play</button>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
