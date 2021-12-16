import React, {
  useEffect, useCallback, useMemo, useRef,
} from 'react';

import { motion, useAnimation, Transition } from 'framer-motion';

import { Media } from 'layout/media';
import Wrapper from 'layout/wrapper';

import Button from 'components/button';

import { BACKGROUND_IMAGES, HEXAGON_IMAGES } from './constants';

export interface HomeHeroProps {

}

export const HomeHero: React.FC<HomeHeroProps> = () => {
  const currBgImageRef = useRef(0);

  const bg01Controls = useAnimation();
  const bg02Controls = useAnimation();
  const bg03Controls = useAnimation();
  const bg04Controls = useAnimation();

  const image01Controls = useAnimation();
  const image02Controls = useAnimation();
  const image03Controls = useAnimation();

  const border01Controls = useAnimation();
  const border02Controls = useAnimation();
  const border03Controls = useAnimation();

  const imageControls = useMemo(() => (
    [image01Controls, image02Controls, image03Controls]
  ), [image01Controls, image02Controls, image03Controls]);

  const borderControls = useMemo(() => (
    [border01Controls, border02Controls, border03Controls]
  ), [border01Controls, border02Controls, border03Controls]);

  const bgControls = useMemo(() => (
    [bg01Controls, bg02Controls, bg03Controls, bg04Controls]
  ), [bg01Controls, bg02Controls, bg03Controls, bg04Controls]);

  const runAnimationSequence = useCallback(async () => {
    const delay = (seconds: number) => new Promise((r) => setTimeout(r, seconds * 1000));

    const setBackground = async (backgroundIndex: number, nextTransition?: Transition) => {
      const { current: currentBackground } = currBgImageRef;
      const transition = { ease: 'easeInOut', ...nextTransition };

      if (!bgControls[backgroundIndex]) return;

      if (backgroundIndex === 0) {
        bgControls[backgroundIndex].start({ opacity: 1 });
        await bgControls[currentBackground].start({ opacity: 0, transition });
      } else {
        await bgControls[backgroundIndex].start({ opacity: 1, transition });
        bgControls[currentBackground].start({ opacity: 0 });
      }

      currBgImageRef.current = backgroundIndex;
    };

    const setScene = async (sceneIndex: number) => {
      const transitionDuration = 2;
      const transition = { duration: transitionDuration };

      setBackground(sceneIndex, transition);
      HEXAGON_IMAGES.forEach((image, index) => {
        if (!imageControls[index]) return;
        imageControls[index].start({ ...image.scenes[sceneIndex], transition });
        if (!borderControls[index]) return;
        borderControls[index].start({ opacity: (sceneIndex - 1 < index) ? 0 : 1, transition });
      });

      return delay(transitionDuration);
    };

    await delay(2);
    await setScene(1);
    await delay(2);
    await setScene(2);
    await delay(2);
    await setScene(3);
    await delay(2);
    await setScene(0);

    runAnimationSequence();
  }, [bgControls, imageControls, borderControls]);

  useEffect(() => {
    // runAnimationSequence();
  }, [runAnimationSequence]);

  return (
    <div
      className="relative text-white w-full h-screen"
      style={{ backgroundColor: BACKGROUND_IMAGES[0].backgroundColor }}
    >
      {BACKGROUND_IMAGES.map(({ image, backgroundColor }, index) => (
        <motion.div
          key={image}
          className="absolute top-0 bottom-0 right-0 left-0 bg-no-repeat bg-right-bottom"
          animate={bgControls[index]}
          style={{
            opacity: (index === currBgImageRef.current) ? 1 : 0,
            backgroundImage: `url(${image})`,
            backgroundColor,
          }}
        />
      ))}
      <Media greaterThanOrEqual="lg">
        {HEXAGON_IMAGES.map(({
          image, size, position, scenes,
        }, index) => (
          <motion.div
            key={image}
            animate={imageControls[index]}
            className="absolute"
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
                  <path
                    d="M29.2376 200C23.5214 190.099 23.5214 177.901 29.2376 168L103.138 40C108.855 30.0992 119.419 24 130.851 24L278.653 24C290.085 24 300.65 30.0992 306.366 40L380.267 168C385.983 177.901 385.983 190.099 380.267 200L306.366 328C300.65 337.901 290.085 344 278.653 344H130.851C119.419 344 108.855 337.901 103.138 328L29.2376 200Z"
                    fill="#00BFFF"
                    fillOpacity="0.2"
                    shapeRendering="crispEdges"
                  />
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
                <clipPath id="hexagon_clip_path" viewBox="0 0 362 320" clipPathUnits="objectBoundingBox">
                  <path d="M0.017,0.552 C0.002,0.522,0.002,0.485,0.017,0.454 L0.224,0.052 C0.239,0.022,0.268,0.003,0.299,0.003 L0.712,0.003 C0.743,0.003,0.772,0.022,0.787,0.052 L0.994,0.454 C1,0.485,1,0.522,0.994,0.552 L0.787,0.954 C0.772,0.985,0.743,1,0.712,1 H0.299 C0.268,1,0.239,0.985,0.224,0.954 L0.017,0.552" />
                </clipPath>
              </svg>
            </div>
          </motion.div>
        ))}
      </Media>
      <Wrapper>
        <div>Spatial conservation planning in the cloud</div>
        <div className="relative z-10 w-full max-w-5xl py-10 m-auto md:py-36">
          <div className="lg:pr-96">
            <h1
              className="pb-8 text-5xl font-semibold leading-tight"
            >
              Spatial conservation planning in the cloud
            </h1>

            <p className="md:pr-40">
              This platform supports decision-making for biodiversity
              {' '}
              and people on land, freshwater and ocean systems.
            </p>

            <div className="mt-10 space-y-4 xs:flex xs:space-x-4 xs:space-y-0 md:mt-18">
              <Button
                className="w-full md:w-40"
                theme="primary"
                size="lg"
                href="/projects"
              >
                Get started
              </Button>

              <Button
                className="w-full md:w-40"
                theme="secondary"
                size="lg"
              >
                How to
              </Button>
            </div>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default HomeHero;
