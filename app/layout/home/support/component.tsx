import React from 'react';

import Wrapper from 'layout/wrapper';

import { PLANNING_PROBLEMS } from './constants';

export interface HomeSupportProps {

}

export const HomeSupport: React.FC<HomeSupportProps> = () => {
  return (
    <div className="bg-gray-700">
      <Wrapper>
        <div className="relative w-full max-w-5xl py-24 mx-auto md:py-44">

          <h3 className="text-2xl text-white md:text-4xl font-heading">
            Types of planning problems that
            {' '}
            <span className="text-primary-500">Marxan can support:</span>
          </h3>

          <div className="grid max-w-5xl grid-cols-1 pt-24 mx-auto md:grid-cols-2 gap-y-10 gap-x-44">
            {PLANNING_PROBLEMS.map((P) => {
              const { id, text, image } = P;

              return (
                <div key={`${id}`} className="flex items-center space-x-6">
                  <img alt={text} src={image} />
                  <p className="text-lg text-white">{text}</p>
                </div>
              );
            })}
          </div>
          <div className="absolute bottom-0 w-full h-px opacity-20" style={{ background: 'linear-gradient(to right, transparent, #ffffff, transparent)' }} />
        </div>
      </Wrapper>

    </div>
  );
};

export default HomeSupport;
