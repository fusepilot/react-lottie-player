declare namespace Lottie {
  // export type AnimationEventType = 'complete' | 'loopComplete' | 'enterFrame' | 'segmentStart' | 'config_ready' | 'data_ready' | 'data_failed' | 'loaded_images' | 'DOMLoaded' | 'destroy'

  export interface AnimationItem {
    play();

    stop();

    pause();

    // one param speed (1 is normal speed)
    setSpeed(speed: number);

    // one param direction (1 is normal direction)
    setDirection(direction: number);

    // If false, it will respect the original AE fps. If true, it will update as much as possible. (true by default)
    setSubframe(flag: boolean);

    gotoFrame(value: number);
    // first param is a numeric value. second param is a boolean that defines time or frames for first param
    goToAndPlay(value: number, isFrame: boolean);

    // first param is a numeric value. second param is a boolean that defines time or frames for first param
    goToAndStop(value: number, isFrame: boolean);

    // first param is a single array or multiple arrays of two values each(fromFrame,toFrame), second param is a boolean for forcing the new segment right away
    playSegments(segments: number[] | number[][], forceFlag: boolean);

    // To destroy and release resources.
    destroy();

    // Get duration in seconds
    getDuration(): number | undefined;

    animType: string | undefined;
    animationData: any | undefined;
    animationID: string | undefined;
    assets: any[] | undefined;
    assetsPath: string | undefined;
    autoloadSegments: boolean;
    autoplay: boolean;
    currentFrame: number | undefined;
    currentRawFrame: number | undefined;
    firstFrame: number | undefined;
    frameModifier: number | undefined;
    frameMult: number | undefined;
    frameRate: number | undefined;
    isLoaded: true;
    isPaused: true;
    loop: true;
    name: string;
    path: string;
    playCount: number;
    playDirection: number;
    playSpeed: number;
    segmentPos: number;
    segments: any[];
    subframeEnabled: boolean;
    timeCompleted: number;
    totalFrames: number;
    wrapper: HTMLElement | undefined;

    addEventListener(
      event: "enterFrame",
      callback: (
        args: {
          type: "enterFrame";
          currentTime: number;
          totalTime: number;
          direction: number;
        }
      ) => void
    ): void;

    addEventListener(
      event: "loopComplete",
      callback: (
        args: {
          type: "loopComplete";
          currentLoop: number;
          totalLoops: boolean; // boolean ? i think this should probably be called frameMult instead
          direction: number;
        }
      ) => void
    ): void;

    addEventListener(
      event: "complete",
      callback: (
        args: {
          type: "complete";
          direction: number;
        }
      ) => void
    ): void;

    addEventListener(
      event: "segmentStart",
      callback: (
        args: {
          type: "segmentStart";
          firstFrame: number;
          totalFrames: number;
        }
      ) => void
    ): void;

    addEventListener(
      event: "destroy",
      callback: (
        args: {
          type: "destroy";
          target: AnimationItem;
        }
      ) => void
    ): void;
  }

  export interface AnimationConfig {
    // an Object with the exported animation data.
    animationData?: any;

    // the relative path to the animation object. (animationData and path are mutually exclusive)
    path?: string;

    // true / false / number
    loop?: boolean | number;

    // true / false it will start playing as soon as it is ready
    autoplay?: boolean;

    // animation name for future reference
    name?: string;

    // 'svg' / 'canvas' / 'html' to set the renderer
    renderer?: string;

    // the dom element on which to render the animation
    container?: any;
  }
}

declare class LottyPlayer {
  // optional parameter name to target a specific animation
  play(name?: string);

  // optional parameter name to target a specific animation
  stop(name?: string);

  // first param speed (1 is normal speed) with 1 optional parameter name to target a specific animation
  setSpeed(speed: number, name?: string);

  // first param direction (1 is normal direction.) with 1 optional parameter name to target a specific animation
  setDirection(direction: number, name?: string);

  // default 'high', set 'high','medium','low', or a number > 1 to improve player performance. In some animations as low as 2 won't show any difference.
  setQuality(quality: string | number);

  // param usually pass as location.href. Its useful when you experience mask issue in safari where your url does not have # symbol.
  setLocationHref(href: string);

  // returns an animation instance to control individually.
  loadAnimation(params: Lottie.AnimationConfig): Lottie.AnimationItem;

  // you can register an element directly with registerAnimation. It must have the "data-animation-path" attribute pointing at the data.json url
  registerAnimation(element: any, animationData?: any);

  // looks for elements with class "lottie"
  searchAnimations(
    animationData?: any,
    standalone?: boolean,
    renderer?: string
  );

  // To destroy and release resources. The DOM element will be emptied.
  destroy(name?: string);
}

declare const Lottie: LottyPlayer;

declare module "lottie-web" {
  export default Lottie;
}
