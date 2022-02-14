import React from 'react';

import Wrapper from 'layout/wrapper';

export interface HomeSupportProps {

}

export const HomeSupport: React.FC<HomeSupportProps> = () => {
  return (
    <div className="bg-gray-800 ">
      <Wrapper>
        <div className="w-full max-w-5xl py-10 mx-auto md:py-32">

          <h3 className="text-4xl text-white font-heading">
            Types of planning problems that
            {' '}
            <span className="text-primary-500">Marxan can support:</span>
          </h3>
          <div className="grid max-w-5xl grid-cols-2 gap-10 mx-auto" />
        </div>
      </Wrapper>
    </div>
  );
};

export default HomeSupport;
