import React from 'react';

import Wrapper from 'layout/wrapper';

import Button from 'components/button';

import HERO_IMAGE from 'images/home-hero/hero-image-1.png';

export interface HomeHeroProps {

}

export const HomeHero: React.FC<HomeHeroProps> = () => {
  return (
    <div className="bg-primary-50 text-gray-800">
      <Wrapper>
        <div className="flex gap-48">
          <div className="w-full py-26 pl-32">
            <h1
              className="pb-8 font-semibold leading-tight text-5xl"
            >
              Spatial conservation planning in the cloud
            </h1>

            <p className="">
              This platform supports decision-making for biodiversity
              {' '}
              and people on land, freshwater and ocean systems.
            </p>

            <div className="flex mt-18 space-x-4">
              <Button
                className="w-40"
                theme="dark"
                size="lg"
                href="/projects"
              >
                Get started
              </Button>

              <Button
                className="w-40"
                theme="secondary-alt"
                size="lg"
              >
                How to
              </Button>
            </div>
          </div>
          <div className="flex-shrink-0 relative top-14">
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
        </div>
      </Wrapper>
    </div>
  );
};

export default HomeHero;
