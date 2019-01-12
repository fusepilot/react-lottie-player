import * as React from "react";
import { useState, useCallback, useRef, useEffect, useReducer } from "react";
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
  direction: 0,
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

export const useLottie = (
  containerRef: React.MutableRefObject<HTMLDivElement>,
  options?: LottieOptions
) => {
  options = { ...{ subframe: true }, ...options };
  const animation = useRef<lottie.AnimationItem>(null);
  const [animationData, setAnimationData] = useState(options.animationData);
  const [eventListenerHandles, setEventListenerHandles] = useState([]);

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(
    () => {
      if (animationData && containerRef) {
        if (animation.current) {
          dispatch({ type: "reset" });
          eventListenerHandles.forEach(eventListenerHandle => {
            eventListenerHandle();
          });
          setEventListenerHandles([]);
          animation.current.destroy();
        }

        const animationOptions: lottie.AnimationConfig = {
          container: containerRef.current,
          renderer: "svg",
          loop: options.loop,
          autoplay: options.autoplay,
          animationData: animationData
        };
        animation.current = lottie.loadAnimation(animationOptions);

        animation.current.setSubframe(options.subframe);

        const duration = animation.current.getDuration();
        const totalFrames = animation.current.totalFrames;
        const playSpeed = animation.current.playSpeed;

        dispatch({
          type: "update",
          state: { duration, totalFrames, playSpeed }
        });

        const enterFrameHandle = animation.current.addEventListener(
          "enterFrame",
          event => {
            const currentFrame = Math.floor(animation.current.currentFrame);
            const direction = animation.current.playDirection;

            const currentTime = event.currentTime / animation.current.frameRate;

            dispatch({
              type: "update",
              state: { currentTime, direction, currentFrame }
            });
          }
        );

        const completeHandle = animation.current.addEventListener(
          "complete",
          ({ direction }) => {
            const duration = animation.current.getDuration();
            dispatch({
              type: "update",
              state: { direction, currentTime: duration }
            });
          }
        );

        const onLoopCompleteHandle = animation.current.addEventListener(
          "loopComplete",
          ({ currentLoop, direction }) => {
            dispatch({
              type: "update",
              state: { currentLoop, direction }
            });
          }
        );

        setEventListenerHandles([
          enterFrameHandle,
          completeHandle,
          onLoopCompleteHandle
        ]);
      }

      return () => {
        animation.current.destroy();

        eventListenerHandles.forEach(eventListenerHandle =>
          eventListenerHandle()
        );
        setEventListenerHandles([]);
      };
    },
    [animationData]
  );

  window.addEventListener;

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
    setAnimationData,
    ...state
  };
};

const Container = styled.div`
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.1);
`;

export const LottieReact = (
  props: LottieProps,
  containerProps: React.HTMLAttributes<HTMLDivElement>
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottie = useLottie(containerRef, {
    animationData: props.options.animationData,
    autoplay: false,
    loop: true
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
      <button onClick={() => lottie.setDirection(-1)}>Reverse</button>
      <button onClick={() => lottie.setAnimationData(checked)}>
        Change Animation Data
      </button>
      <pre>{JSON.stringify(lottie, undefined, 2)}</pre>
    </>
  );
};
