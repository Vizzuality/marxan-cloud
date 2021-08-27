import React from 'react';

import { Media } from 'layout/media';
import Wrapper from 'layout/wrapper';

import Button from 'components/button';

import HERO_IMAGE from 'images/home-hero/hero-image-1.png';

export interface HomeHeroProps {

}

export const HomeHero: React.FC<HomeHeroProps> = () => {
  return (
    <div className="relative text-gray-800 bg-primary-50">
      <Wrapper>
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
                theme="dark"
                size="lg"
                href="/projects"
              >
                Get started
              </Button>

              <Button
                className="w-full md:w-40"
                theme="dark-alt"
                size="lg"
              >
                How to
              </Button>
            </div>
          </div>
        </div>
      </Wrapper>

      <Media greaterThanOrEqual="lg">
        <div className="absolute top-0 left-0 z-0 w-full h-full">
          <Wrapper>
            <div className="relative flex justify-end flex-shrink-0 w-full top-14">
              <img
                alt=""
                src={HERO_IMAGE}
                style={{
                  width: '384px',
                  height: 'auto',
                  filter: 'drop-shadow(0px 8px 15px rgba(0, 0, 0, .35))',
                }}
              />
            </div>
          </Wrapper>
        </div>
      </Media>
    </div>
  );
};

export default HomeHero;
