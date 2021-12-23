import React, {
  useEffect, useCallback, useMemo, useRef,
} from 'react';

import { motion, useAnimation, Transition } from 'framer-motion';

import { Media } from 'layout/media';

import { BACKGROUND_IMAGES, MAIN_IMAGES } from './constants';

export interface HeroAnimationProps {

}

export const HeroAnimation: React.FC<HeroAnimationProps> = () => {
  const shouldStopAnimation = useRef(false);

  // Keeping track of the current background image
  const currBgImageRef = useRef(0);

  // Background images controls
  const bg01Controls = useAnimation();
  const bg02Controls = useAnimation();
  const bg03Controls = useAnimation();
  const bg04Controls = useAnimation();

  const bgControls = useMemo(() => (
    [bg01Controls, bg02Controls, bg03Controls, bg04Controls]
  ), [bg01Controls, bg02Controls, bg03Controls, bg04Controls]);

  // Main images controls
  const image01Controls = useAnimation();
  const image02Controls = useAnimation();
  const image03Controls = useAnimation();

  const imageControls = useMemo(() => (
    [image01Controls, image02Controls, image03Controls]
  ), [image01Controls, image02Controls, image03Controls]);

  // Hexagon borders controls
  const border01Controls = useAnimation();
  const border02Controls = useAnimation();
  const border03Controls = useAnimation();

  const borderControls = useMemo(() => (
    [border01Controls, border02Controls, border03Controls]
  ), [border01Controls, border02Controls, border03Controls]);

  const stopAnimation = useCallback(() => {
    shouldStopAnimation.current = true;
    [...bgControls, ...imageControls, ...borderControls].forEach((control) => control.stop());
  }, [bgControls, borderControls, imageControls]);

  // The animation sequence. It'll call itself at the end, in order to create a loop.
  const startAnimation = useCallback(async () => {
    shouldStopAnimation.current = false;

    // Little helper to create delays. It returns a promise that'll resolve in n seconds.
    const delay = (seconds: number) => new Promise((r) => setTimeout(r, seconds * 1000));

    // Setting the background image by its index
    const setBackground = async (backgroundIndex: number, nextTransition?: Transition) => {
      const { current: currentBackground } = currBgImageRef;
      const transition = { ease: 'easeInOut', ...nextTransition };

      if (shouldStopAnimation.current) return;
      if (!bgControls[backgroundIndex]) return;

      // In order to fade the background images, we make the next image element fade in
      // by setting its opacity to 1, with a transition. However, in order to fade back
      // from the last background element to the first one, because of the elements order
      // we must instead fade out the current image to reveal the first background underneath
      if (backgroundIndex === 0) {
        bgControls[backgroundIndex].start({ opacity: 1 });
        await bgControls[currentBackground].start({ opacity: 0, transition });
      } else {
        await bgControls[backgroundIndex].start({ opacity: 1, transition });
        bgControls[currentBackground].start({ opacity: 0 });
      }

      currBgImageRef.current = backgroundIndex;
    };

    // Setting the scene by index. This animates the images, hexagon borders, and background
    const setScene = async (sceneIndex: number) => {
      const transitionDuration = 2;
      const transition = { duration: transitionDuration };

      if (shouldStopAnimation.current) {
        return Promise.resolve();
      }

      setBackground(sceneIndex, transition);

      MAIN_IMAGES.forEach((image, index) => {
        if (!imageControls[index] || !borderControls[index]) return;
        imageControls[index].start({ ...image.scenes[sceneIndex], transition });
        borderControls[index].start({ opacity: (sceneIndex - 1 < index) ? 0 : 1, transition });
      });

      // Because we're starting multiple animations at once, we're not making use of the
      // promises returned by the controls. Instead in order to keep the loop consistent,
      // we return a delay promise equivalent to the transition duration.
      return delay(transitionDuration * 2);
    };

    // Setting the sequence. Scene 0 is the default one, but this way it gives it a dela
    await setScene(1);
    await setScene(2);
    await setScene(3);
    await setScene(0);

    if (shouldStopAnimation.current) return;

    // Recursion
    startAnimation();
  }, [bgControls, imageControls, borderControls]);

  // https://github.com/framer/motion/issues/501
  const visibilityChangeHandler = useCallback(async () => {
    if (document.visibilityState === 'visible') {
      startAnimation();
    } else {
      stopAnimation();
    }
  }, [startAnimation, stopAnimation]);

  useEffect(() => {
    document.addEventListener('visibilitychange', visibilityChangeHandler);

    startAnimation();

    return (() => {
      document.removeEventListener('visibilitychange', visibilityChangeHandler);
    });
  }, [startAnimation, visibilityChangeHandler]);

  return (
    <div className="absolute text-white top-0 bottom-0 w-full">
      {BACKGROUND_IMAGES.map(({ image, backgroundColor }, index) => (
        <motion.div
          key={image}
          className="absolute w-full h-full bg-no-repeat bg-right-bottom"
          animate={bgControls[index]}
          style={{
            opacity: (index === currBgImageRef.current) ? 1 : 0,
            backgroundImage: `url(${image})`,
            backgroundColor,
          }}
        />
      ))}

      <Media greaterThanOrEqual="lg">
        {MAIN_IMAGES.map(({
          image, size, position, scenes,
        }, index) => (
          <motion.div
            key={image}
            className="absolute"
            animate={imageControls[index]}
            style={{ ...size, ...position, ...scenes[0] }}
          >
            <div
              className="absolute"
              style={{ transform: 'scale(1.28)' }}
            >
              <svg
                width="409"
                height="368"
                viewBox="0 0 409 368"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  {/* Gray border, when the hexagon is not active */}
                  <path
                    d="M31.4027 198.75C26.133 189.623 26.133 178.377 31.4027 169.25L105.304 41.25C110.573 32.1227 120.312 26.5 130.851 26.5L278.653 26.5C289.192 26.5 298.931 32.1227 304.201 41.25L378.102 169.25C383.371 178.377 383.371 189.623 378.102 198.75L304.201 326.75C298.931 335.877 289.192 341.5 278.653 341.5H130.851C120.312 341.5 110.573 335.877 105.304 326.75L31.4027 198.75Z"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    opacity="0.5"
                  />
                </g>
                <motion.g
                  filter="url(#hexagon_border_filter)"
                  opacity="0"
                  animate={borderControls[index]}
                >
                  {/* Blue neon-like shadow */}
                  <path
                    d="M29.2376 200C23.5214 190.099 23.5214 177.901 29.2376 168L103.138 40C108.855 30.0992 119.419 24 130.851 24L278.653 24C290.085 24 300.65 30.0992 306.366 40L380.267 168C385.983 177.901 385.983 190.099 380.267 200L306.366 328C300.65 337.901 290.085 344 278.653 344H130.851C119.419 344 108.855 337.901 103.138 328L29.2376 200Z"
                    fill="#00BFFF"
                    fillOpacity="0.2"
                    shapeRendering="crispEdges"
                  />
                  {/* Blue line that the shadow seems to emerge from */}
                  <path
                    d="M31.4027 198.75C26.133 189.623 26.133 178.377 31.4027 169.25L105.304 41.25C110.573 32.1227 120.312 26.5 130.851 26.5L278.653 26.5C289.192 26.5 298.931 32.1227 304.201 41.25L378.102 169.25C383.371 178.377 383.371 189.623 378.102 198.75L304.201 326.75C298.931 335.877 289.192 341.5 278.653 341.5H130.851C120.312 341.5 110.573 335.877 105.304 326.75L31.4027 198.75Z"
                    stroke="#00BFFF"
                    strokeWidth="5"
                    shapeRendering="crispEdges"
                  />
                </motion.g>
                <defs>
                  <filter id="hexagon_border_filter" x="0.950195" y="0" width="407.604" height="368" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset />
                    <feGaussianBlur stdDeviation="12" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.74902 0 0 0 0 1 0 0 0 1 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_7215_10516" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_7215_10516" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset />
                    <feGaussianBlur stdDeviation="12" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.74902 0 0 0 0 1 0 0 0 1 0" />
                    <feBlend mode="normal" in2="shape" result="effect2_innerShadow_7215_10516" />
                  </filter>
                </defs>
              </svg>
            </div>

            <div
              className="absolute bg-no-repeat bg-center bg-cover"
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${image})`,
                clipPath: 'url(#hexagon_clip_path)',
                WebkitClipPath: 'url(#hexagon_clip_path)',
              }}
            >
              <svg>
                {/* This clip path 'clips' the images to their hexagonal shape */}
                <clipPath id="hexagon_clip_path" viewBox="0 0 362 320" clipPathUnits="objectBoundingBox">
                  <path d="M0.017,0.552 C0.002,0.522,0.002,0.485,0.017,0.454 L0.224,0.052 C0.239,0.022,0.268,0.003,0.299,0.003 L0.712,0.003 C0.743,0.003,0.772,0.022,0.787,0.052 L0.994,0.454 C1,0.485,1,0.522,0.994,0.552 L0.787,0.954 C0.772,0.985,0.743,1,0.712,1 H0.299 C0.268,1,0.239,0.985,0.224,0.954 L0.017,0.552" />
                </clipPath>
              </svg>
            </div>
          </motion.div>
        ))}
      </Media>
    </div>
  );
};

export default HeroAnimation;
