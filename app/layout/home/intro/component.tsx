import React from 'react';

import Link from 'next/link';

import Wrapper from 'layout/wrapper';

import Button from 'components/button';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';

import HeroAnimation, { BACKGROUND_IMAGES } from './intro-animation';

export interface HomeIntroProps {

}

export const HomeIntro: React.FC<HomeIntroProps> = () => {
  const { backgroundColor } = BACKGROUND_IMAGES[0];

  return (
    <div
      className="relative flex items-center w-full min-h-screen pt-24 text-white md:h-screen md:pt-0"
      style={{ backgroundColor }}
    >
      <HeroAnimation />
      <Wrapper>
        <div className="relative z-10 flex flex-col justify-between w-full h-full max-w-5xl py-8 m-auto md:py-0 md:mt-64 md:mb-48">
          <div className="lg:pr-80">
            <h1
              className="pb-8 text-5xl font-semibold leading-tight"
            >
              Spatial Conservation Planning for Nature and People
            </h1>

            <p className="md:pr-32">
              The Marxan Planning Platform (MaPP) supports collaboration and decision-making for
              biodiversity conservation and socio-economic objectives for land, freshwater and
              ocean systems.
            </p>

            <div className="mt-10 space-y-4 xs:flex xs:space-x-4 xs:space-y-0 md:mt-18 md:mb-18">
              <Button
                className="w-full md:w-40"
                theme="primary"
                size="lg"
                href="/projects"
              >
                Get started
              </Button>

              <Button
                className="w-full md:w-64"
                theme="secondary"
                size="lg"
                href="/community"
              >
                Explore the community
              </Button>
            </div>
          </div>

          <div className="relative bottom-0 mt-10 text-center md:absolute md:mt-0 md:text-left">
            <Link href="#features">
              <a className="mt-8" href="#features">
                Discover more
                <ARROW_DOWN_SVG className="inline w-3 ml-3" fill="white" />
              </a>
            </Link>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default HomeIntro;
