"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_1 = require("react");
const lottie = require("lottie-web");
const styled_1 = require("@emotion/styled");
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
function reducer(state, action) {
    switch (action.type) {
        case "reset":
            return initialState;
        case "update":
            return { ...state, ...action.state };
        default:
            return state;
    }
}
const Container = styled_1.default.div `
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.04);
`;
exports.useLottie = (containerRef, options) => {
    options = { ...{ subframe: true }, ...options };
    const animation = react_1.useRef(null);
    const [state, dispatch] = react_1.useReducer(reducer, initialState);
    const onEnterFrame = react_1.useCallback(event => {
        const currentFrame = Math.floor(animation.current.currentFrame);
        const direction = animation.current.playDirection;
        const currentTime = event.currentTime / animation.current.frameRate;
        dispatch({
            type: "update",
            state: { currentTime, direction, currentFrame }
        });
    }, []);
    const onLoopCompleteHandler = react_1.useCallback(({ currentLoop, direction }) => {
        dispatch({
            type: "update",
            state: { currentLoop, direction }
        });
    }, []);
    const onCompleteHandler = react_1.useCallback(({ direction }) => {
        const duration = animation.current.getDuration();
        dispatch({
            type: "update",
            state: { direction, currentTime: duration, isPlaying: false }
        });
    }, []);
    const onSegmentStart = react_1.useCallback(({ direction }) => {
        const duration = animation.current.getDuration();
        dispatch({
            type: "update",
            state: { direction, currentTime: duration }
        });
    }, []);
    react_1.useEffect(() => {
        const animationOptions = Object.assign({
            loop: true,
            autoplay: true,
            renderer: "svg"
        }, options, {
            container: containerRef.current
        });
        if (animation.current) {
            animation.current.removeEventListener("enterFrame", onEnterFrame);
            animation.current.removeEventListener("loopComplete", onLoopCompleteHandler);
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
                animation.current.removeEventListener("loopComplete", onLoopCompleteHandler);
                animation.current.removeEventListener("complete", onCompleteHandler);
                animation.current.removeEventListener("segmentStart", onSegmentStart);
                animation.current.destroy();
                animation.current = null;
                dispatch({ type: "reset" });
            }
        };
    }, [options.animationData]);
    react_1.useEffect(() => {
        animation.current.loop = options.loop;
    }, [options.loop]);
    react_1.useEffect(() => {
        animation.current.autoplay = options.autoplay;
    }, [options.autoplay]);
    const play = react_1.useCallback(() => {
        if (animation.current) {
            animation.current.play();
            dispatch({
                type: "update",
                state: { isPlaying: true, isStopped: false, isPaused: false }
            });
        }
    }, [animation.current]);
    const stop = react_1.useCallback(() => {
        if (animation.current) {
            animation.current.stop();
            dispatch({
                type: "update",
                state: { isPlaying: false, isStopped: true, isPaused: false }
            });
        }
    }, [animation.current]);
    const pause = react_1.useCallback(() => {
        if (animation.current) {
            animation.current.pause();
            dispatch({
                type: "update",
                state: { isPlaying: false, isStopped: false, isPaused: true }
            });
        }
    }, [animation.current]);
    const setFrame = react_1.useCallback((frame) => {
        if (state.isPlaying)
            animation.current.goToAndPlay(frame, true);
        else
            animation.current.goToAndStop(frame, true);
    }, [animation.current]);
    const setTime = react_1.useCallback((time) => {
        if (animation.current) {
            if (state.isPlaying)
                animation.current.goToAndPlay(time * 1000, false);
            else
                animation.current.goToAndStop(time * 1000, false);
        }
    }, [animation.current, state.isPlaying]);
    const setSpeed = react_1.useCallback((speed) => {
        if (animation.current) {
            animation.current.setSpeed(speed);
            dispatch({
                type: "update",
                state: { playSpeed: animation.current.playSpeed }
            });
        }
    }, [animation.current]);
    const setDirection = react_1.useCallback((direction) => {
        if (animation.current) {
            animation.current.setDirection(direction);
            dispatch({
                type: "update",
                state: { direction: animation.current.playDirection }
            });
        }
    }, [animation.current]);
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
exports.Lottie = (props) => {
    const containerRef = react_1.useRef(null);
    const lottie = exports.useLottie(containerRef, {
        ...props.options,
        ...{ loop: props.loop, autoplay: props.autoplay }
    });
    react_1.useEffect(() => {
        if (props.currentFrame)
            lottie.setFrame(props.currentFrame);
        else {
            if (props.isPaused)
                lottie.pause();
            else {
                props.isPlaying ? lottie.play() : lottie.stop();
            }
        }
    }, [props.currentFrame, props.isPlaying, props.isPaused]);
    return React.createElement(Container, Object.assign({ ref: containerRef }, props.containerProps));
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
//# sourceMappingURL=lottie.js.map