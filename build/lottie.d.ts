import * as React from "react";
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
export declare const useLottie: (containerRef: React.MutableRefObject<HTMLDivElement>, options?: LottieOptions) => {
    duration?: number;
    currentFrame?: number;
    currentTime?: number;
    totalFrames?: number;
    direction?: number;
    playSpeed?: number;
    currentLoop?: number;
    isPlaying?: boolean;
    isLoaded?: boolean;
    isPaused?: boolean;
    isStopped?: boolean;
    play: () => void;
    stop: () => void;
    pause: () => void;
    setFrame: (frame: number) => void;
    setTime: (time: number) => void;
    setSpeed: (speed: number) => void;
    setDirection: (direction: 1 | -1) => void;
};
export declare const Lottie: (props: LottieProps) => JSX.Element;
