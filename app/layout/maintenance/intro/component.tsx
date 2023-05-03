import React from 'react';

import { motion } from 'framer-motion';

import Wrapper from 'layout/wrapper';

import HeroAnimation, { BACKGROUND_IMAGES } from './intro-animation';

export interface HomeIntroProps {}

export const HomeIntro: React.FC<HomeIntroProps> = () => {
  const { backgroundColor } = BACKGROUND_IMAGES[0];

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
              Under maintenance
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
              The Marxan Planning Platform (MaPP) is currently undergoing maintenance. We will be
              back shortly.
            </motion.p>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default HomeIntro;
