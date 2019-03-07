import * as React from "react";
import { useState, useCallback, useRef, useEffect, useReducer } from "react";
import * as PropTypes from "prop-types";
import * as lottie from "lottie-web";

import styled from "@emotion/styled";

export interface LottieOptions {
  renderer?: "svg" | "canvas" | "html";
  /**
   * Defines if the animation should play only once or repeatedly in an endless loop
   */
  loop?: boolean;
  /**
   * Defines if the animation should immediately play when the component enters the DOM
   */
  autoplay?: boolean;

  subframe?: boolean;
  /**
   * The JSON data exported from Adobe After Effects using the Bodymovin plugin
   */
  animationData: any;

  /**
   * Array of objects containing eventName and a callback function that will be registered as eventListeners on the animation object.
   * Refer to Lottie documentation for a list of available events.
   */
  segments?: number[];
  rendererSettings?: {
    preserveAspectRatio?: string;
    /**
     * The canvas context
     */
    context?: any;
    scaleMode?: any;
    clearCanvas?: boolean;
    /**
     * Loads DOM elements when needed. Might speed up initialization for large number of elements. Only with SVG renderer.
     */
    progressiveLoad?: boolean;
    /**
     * Hides elements when opacity reaches 0. Only with SVG renderer.
     * @default true
     */
    hideOnTransparent?: boolean;
    className?: string;
  };
}

export interface LottieProps {
  /**
   * Object representing animation settings
   */
  options: LottieOptions;
  /**
   * Height size in pixels
   * @default '100%'
   */
  height?: number | string;
  /**
   * Width size in pixels
   * @default '100%'
   */
  width?: number | string;
  /**
   * Describes if the animation must be in stopped mode
   */
  isStopped?: boolean;
  /**
   * Describes if the animation must be in paused mode
   */
  isPaused?: boolean;
  speed?: number;
  direction?: number;

  loop?: boolean;
  autoplay?: boolean;

  containerProps?: React.HTMLAttributes<HTMLDivElement>;

  currentFrame?: number;

  isPlaying?: boolean;
}

const initialState = {
  duration: 0,
  currentFrame: 0,
  currentTime: 0,
  totalFrames: 0,
  direction: 1,
  playSpeed: 1,
  currentLoop: 0,
  isPlaying: false,
  isLoaded: false,
  isPaused: false,
  isStopped: true
};

type State = typeof initialState;
type ActionType = {
  type: "reset";
};
type UpdateAction = {
  type: "update";
  state: Partial<State>;
};

function reducer(
  state: State,
  action: ActionType | UpdateAction
): Partial<State> {
  switch (action.type) {
    case "reset":
      return initialState;
    case "update":
      return { ...state, ...action.state };
    default:
      return state;
  }
}

const Container = styled.div`
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.04);
`;

export const useLottie = (
  containerRef: React.MutableRefObject<HTMLDivElement>,
  options?: LottieOptions
) => {
  options = { ...{ subframe: true }, ...options };

  const animation = useRef<lottie.AnimationItem>(null);
  const [state, dispatch] = useReducer(reducer, initialState);

  const onEnterFrame = useCallback(event => {
    const currentFrame = Math.floor(animation.current.currentFrame);
    const direction = animation.current.playDirection;
    const currentTime = event.currentTime / animation.current.frameRate;
    dispatch({
      type: "update",
      state: { currentTime, direction, currentFrame }
    });
  }, []);

  const onLoopCompleteHandler = useCallback(({ currentLoop, direction }) => {
    dispatch({
      type: "update",
      state: { currentLoop, direction }
    });
  }, []);

  const onCompleteHandler = useCallback(({ direction }) => {
    const duration = animation.current.getDuration();
    dispatch({
      type: "update",
      state: { direction, currentTime: duration, isPlaying: false }
    });
  }, []);

  const onSegmentStart = useCallback(({ direction }) => {
    const duration = animation.current.getDuration();
    dispatch({
      type: "update",
      state: { direction, currentTime: duration }
    });
  }, []);

  useEffect(() => {
    const animationOptions = Object.assign(
      {
        loop: true,
        autoplay: true,
        renderer: "svg"
      },
      options,
      {
        container: containerRef.current
      }
    );

    if (animation.current) {
      animation.current.removeEventListener("enterFrame", onEnterFrame);
      animation.current.removeEventListener(
        "loopComplete",
        onLoopCompleteHandler
      );
      animation.current.removeEventListener("complete", onCompleteHandler);
      animation.current.removeEventListener("segmentStart", onSegmentStart);
      animation.current.destroy();
      animation.current = null;
      dispatch({ type: "reset" });
    }

    animation.current = lottie.loadAnimation(animationOptions);

    animation.current.addEventListener("enterFrame", onEnterFrame);
    animation.current.addEventListener("loopComplete", onLoopCompleteHandler);
    animation.current.addEventListener("complete", onCompleteHandler);
    animation.current.addEventListener("segmentStart", onCompleteHandler);

    animation.current.setSubframe(options.subframe);

    const duration = animation.current.getDuration();
    const totalFrames = animation.current.totalFrames;
    const playSpeed = animation.current.playSpeed;

    dispatch({
      type: "update",
      state: { duration, totalFrames, playSpeed }
    });

    return () => {
      if (animation.current) {
        animation.current.removeEventListener("enterFrame", onEnterFrame);
        animation.current.removeEventListener(
          "loopComplete",
          onLoopCompleteHandler
        );
        animation.current.removeEventListener("complete", onCompleteHandler);
        animation.current.removeEventListener("segmentStart", onSegmentStart);
        animation.current.destroy();
        animation.current = null;
        dispatch({ type: "reset" });
      }
    };
  }, [options.animationData]);

  useEffect(() => {
    animation.current.loop = options.loop;
  }, [options.loop]);

  useEffect(() => {
    animation.current.autoplay = options.autoplay;
  }, [options.autoplay]);

  const play = useCallback(() => {
    if (animation.current) {
      animation.current.play();
      dispatch({
        type: "update",
        state: { isPlaying: true, isStopped: false, isPaused: false }
      });
    }
  }, [animation.current]);

  const stop = useCallback(() => {
    if (animation.current) {
      animation.current.stop();
      dispatch({
        type: "update",
        state: { isPlaying: false, isStopped: true, isPaused: false }
      });
    }
  }, [animation.current]);

  const pause = useCallback(() => {
    if (animation.current) {
      animation.current.pause();
      dispatch({
        type: "update",
        state: { isPlaying: false, isStopped: false, isPaused: true }
      });
    }
  }, [animation.current]);

  const setFrame = useCallback(
    (frame: number) => {
      if (state.isPlaying) animation.current.goToAndPlay(frame, true);
      else animation.current.goToAndStop(frame, true);
    },
    [animation.current]
  );

  const setTime = useCallback(
    (time: number) => {
      if (animation.current) {
        if (state.isPlaying) animation.current.goToAndPlay(time * 1000, false);
        else animation.current.goToAndStop(time * 1000, false);
      }
    },
    [animation.current, state.isPlaying]
  );

  const setSpeed = useCallback(
    (speed: number) => {
      if (animation.current) {
        animation.current.setSpeed(speed);
        dispatch({
          type: "update",
          state: { playSpeed: animation.current.playSpeed }
        });
      }
    },
    [animation.current]
  );

  const setDirection = useCallback(
    (direction: -1 | 1) => {
      if (animation.current) {
        animation.current.setDirection(direction);
        dispatch({
          type: "update",
          state: { direction: animation.current.playDirection }
        });
      }
    },
    [animation.current]
  );

  return {
    play,
    stop,
    pause,
    setFrame,
    setTime,
    setSpeed,
    setDirection,
    ...state
  };
};

export const Lottie = (props: LottieProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottie = useLottie(containerRef, {
    ...props.options,
    ...{ loop: props.loop, autoplay: props.autoplay }
  });

  useEffect(() => {
    if (props.currentFrame) lottie.setFrame(props.currentFrame);
    else {
      if (props.isPaused) lottie.pause();
      else {
        props.isPlaying ? lottie.play() : lottie.stop();
      }
    }
  }, [props.currentFrame, props.isPlaying, props.isPaused]);

  return <Container ref={containerRef} {...props.containerProps} />;
};

// export const LottieTest = () => {
//   const [frame, setFrame] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [isPaused, setIsPaused] = useState(false);

//   useEffect(() => {
//     setInterval(() => {
//       setFrame(Math.floor(Math.random() * 15));
//     }, 20);
//   }, []);

//   return (
//     <>
//       <Lottie
//         options={{ animationData: checked, autoplay: false }}
//         containerProps={{ "aria-label": "hey", title: "hey", role: "hey" }}
//         // currentFrame={frame}
//         isPlaying={isPlaying}
//         isPaused={isPaused}
//       />
//       <button
//         onClick={() => {
//           setIsPlaying(isPlaying ? false : true);
//         }}
//       >
//         Toggle Playing
//       </button>
//       <button
//         onClick={() => {
//           setIsPaused(isPaused ? false : true);
//         }}
//       >
//         Toggle Paused
//       </button>
//       {/* <button onClick={lottie.play}>Play</button>
//       <button onClick={lottie.pause}>Pause</button>
//       <button onClick={lottie.stop}>Stop</button>
//       <button onClick={() => lottie.setTime(Math.random() * lottie.duration)}>
//         Random Frame
//       </button>
//       <button onClick={() => lottie.setSpeed(0.1)}>Slow down</button>
//       <button
//         onClick={() => lottie.setDirection(lottie.direction == 1 ? -1 : 1)}
//       >
//         Reverse
//       </button> */}
//       {/* <button onClick={() => lottie.setAnimationData(checked)}>
//       Change Animation Data
//     </button> */}
//       {/* <pre>{JSON.stringify(lottie, undefined, 2)}</pre> */}
//     </>
//   );
// };
