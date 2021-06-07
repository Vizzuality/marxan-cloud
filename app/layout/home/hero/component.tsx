import React from 'react';

import Wrapper from 'layout/wrapper';

import Button from 'components/button';

export interface HomeHeroProps {

}

export const HomeHero: React.FC<HomeHeroProps> = () => {
  return (
    <Wrapper>
      <div className="w-full py-32 text-center">
        <h1
          className="max-w-3xl pb-10 mx-auto font-semibold leading-tight text-transparent bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-7xl"
        >
          Spatial conservation planning in the cloud
        </h1>

        <p className="max-w-lg mx-auto">
          This platform supports decision-making for biodiversity
          {' '}
          and people on land, freshwater and ocean systems.
        </p>

        <div className="flex items-center justify-center mt-10 space-x-4">
          <Button
            className="w-40"
            theme="spacial"
            size="lg"
            href="/projects"
          >
            Get started
          </Button>

          <Button
            className="w-40"
            theme="secondary"
            size="lg"
          >
            How to
          </Button>
        </div>
      </div>
    </Wrapper>
  );
};

export default HomeHero;
