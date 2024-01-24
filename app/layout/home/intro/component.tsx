import React, { useCallback } from 'react';

import { motion } from 'framer-motion';

import Button from 'components/button';
import Icon from 'components/icon';
import Wrapper from 'layout/wrapper';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';

import HeroAnimation, { BACKGROUND_IMAGES } from './intro-animation';

export const HomeIntro: React.FC = () => {
  const { backgroundColor } = BACKGROUND_IMAGES[0];

  const onDiscover = useCallback(() => {
    const $scrollToElement = document.getElementById('home-support-section');

    window.scrollTo({
      top: $scrollToElement.offsetTop,
      left: 0,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div
      className="relative flex min-h-screen w-full items-center pt-44 text-white md:h-screen md:pt-0"
      style={{ backgroundColor }}
    >
      <HeroAnimation />
      <Wrapper>
        <div className="relative z-10 m-auto flex h-full w-full max-w-5xl flex-col justify-between py-8 md:mb-48 md:mt-52 md:py-0">
          <div className="lg:pr-80">
            <motion.h1
              className="pb-8 text-5xl font-semibold leading-tight"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
              }}
            >
              Spatial Conservation Planning for Nature and People
            </motion.h1>

            <motion.p
              className="md:pr-32"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.15,
              }}
            >
              The Marxan Planning Platform (MaPP) supports collaboration and decision-making for
              biodiversity conservation and socio-economic objectives for land, freshwater and ocean
              systems.
            </motion.p>

            <motion.div
              className="md:mb-18 md:mt-18 mt-10 flex space-y-4 xs:space-x-4 xs:space-y-0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.15 * 2,
              }}
            >
              <Button className="w-full md:w-40" theme="primary" size="lg" href="/projects">
                Get started
              </Button>

              <Button
                className="w-full md:w-64"
                theme="secondary"
                size="lg"
                href="/community/projects"
              >
                Explore the community
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="relative bottom-0 mt-10 text-center md:absolute md:mt-0 md:text-left"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.15 * 3,
            }}
          >
            <button className="mt-8 focus:outline-none" type="button" onClick={onDiscover}>
              Discover more
              <Icon icon={ARROW_DOWN_SVG} className="ml-3.5 inline w-3.5 animate-bounce" />
            </button>
          </motion.div>
        </div>
      </Wrapper>
    </div>
  );
};

export default HomeIntro;
