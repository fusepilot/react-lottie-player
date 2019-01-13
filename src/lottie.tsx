import * as React from "react";
import { useState, useCallback, useRef, useEffect, useReducer } from "react";
import * as PropTypes from "prop-types";
import lottie from "lottie-web";
import * as checked from "./checked.json";

import styled from "@emotion/styled";

export interface LottieOptions {
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

export interface LottieEventListener {
  /**
   * The event sent by Lottie
   */
  eventName:
    | "complete"
    | "loopComplete"
    | "enterFrame"
    | "segmentStart"
    | "config_ready"
    | "data_ready"
    | "loaded_images"
    | "DOMLoaded"
    | "destroy";
  /**
   * A callback that will be executed when the given eventName is received
   */
  callback: () => void;
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
  /**
   * Array of objects containing eventName and a callback function that will be registered as eventListeners on the animation object.
   * Refer to Lottie documentation for a list of available events.
   */
  segments?: number[];
  speed?: number;
  direction?: number;
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

function usePrevious<T>(value: T): T {
  const ref = useRef(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// export const useLottie = (
//   containerRef: React.MutableRefObject<HTMLDivElement>,
//   options?: LottieOptions
// ) => {
//   options = { ...{ subframe: true }, ...options };
//   const [animation, setAnimation] = useState<lottie.AnimationItem>(null);
//   const [animationData, setAnimationData] = useState(options.animationData);
//   const [eventListenerHandlers, setEventListenerHandlers] = useState([]);
//   const previousAnimationData = usePrevious(animationData);

//   const [state, dispatch] = useReducer(reducer, initialState);

//   const enterFrameHandler = useCallback(event => {
//     const currentFrame = Math.floor(animation.currentFrame);
//     const direction = animation.playDirection;
//     const currentTime = event.currentTime / animation.frameRate;

//     dispatch({
//       type: "update",
//       state: { currentTime, direction, currentFrame }
//     });
//   }, []);

//

//   useEffect(
//     () => {
//       if (animationData != previousAnimationData && containerRef) {
//         // unregisterEvents();

//         const animationOptions: lottie.AnimationConfig = {
//           container: containerRef.current,
//           renderer: "svg",
//           loop: options.loop,
//           autoplay: options.autoplay,
//           animationData: animationData
//         };
//         const animation2 = lottie.loadAnimation(animationOptions);
//         setAnimation(animation2);

//         // registerEvents();

//         animation2.setSubframe(options.subframe);

//         const duration = animation2.getDuration();
//         const totalFrames = animation2.totalFrames;
//         const playSpeed = animation2.playSpeed;

//         // dispatch({
//         //   type: "update",
//         //   state: { duration, totalFrames, playSpeed }
//         // });
//       }

//       return () => {
//         // unregisterEvents();
//         // animation.onEnterFrame = undefined;
//         console.log("return");
//         // animation.stop();
//         animation.onEnterFrame = undefined;
//         animation.onLoopComplete = undefined;
//         animation.onComplete = undefined;
//         animation.destroy();
//         dispatch({ type: "reset" });
//       };
//     },
//     [animationData]
//   );

// };

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
  // const [animation, setAnimation] = useState<lottie.AnimationItem>(null);
  const [state, dispatch] = useReducer(reducer, initialState);

  const onEnterFrame = useCallback(event => {
    const currentFrame = Math.floor(animation.current.currentFrame);
    const direction = animation.current.playDirection;
    const currentTime = event.currentTime / animation.current.frameRate;
    setTimeout(() => {
      dispatch({
        type: "update",
        state: { currentTime, direction, currentFrame }
      });
    }, 0);
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

  useEffect(
    () => {
      const animationOptions = {
        container: containerRef.current,
        renderer: "svg",
        loop: options.loop,
        autoplay: options.autoplay,
        animationData: options.animationData
        // segments: segments !== false,
      };

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
    },
    [options.animationData]
  );

  const play = useCallback(
    () => {
      if (animation.current) {
        animation.current.play();
        dispatch({
          type: "update",
          state: { isPlaying: true, isStopped: false, isPaused: false }
        });
      }
    },
    [animation.current]
  );

  const stop = useCallback(
    () => {
      if (animation.current) {
        animation.current.stop();
        dispatch({
          type: "update",
          state: { isPlaying: false, isStopped: true, isPaused: false }
        });
      }
    },
    [animation.current]
  );

  const pause = useCallback(
    () => {
      if (animation.current) {
        animation.current.pause();
        dispatch({
          type: "update",
          state: { isPlaying: false, isStopped: false, isPaused: true }
        });
      }
    },
    [animation.current]
  );

  const setFrame = useCallback(
    (frame: number) => animation.current.gotoFrame(frame),
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

export const LottieReact = (
  props: LottieProps,
  containerProps: React.HTMLAttributes<HTMLDivElement>
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottie = useLottie(containerRef, {
    animationData: props.options.animationData
  });

  return (
    <>
      <Container ref={containerRef} {...containerProps} />
      <button onClick={lottie.play}>Play</button>
      <button onClick={lottie.pause}>Pause</button>
      <button onClick={lottie.stop}>Stop</button>
      <button onClick={() => lottie.setTime(Math.random() * lottie.duration)}>
        Random Frame
      </button>
      <button onClick={() => lottie.setSpeed(0.1)}>Slow down</button>
      <button
        onClick={() => lottie.setDirection(lottie.direction == 1 ? -1 : 1)}
      >
        Reverse
      </button>
      {/* <button onClick={() => lottie.setAnimationData(checked)}>
      Change Animation Data
    </button> */}
      <pre>{JSON.stringify(lottie, undefined, 2)}</pre>
    </>
  );
};
