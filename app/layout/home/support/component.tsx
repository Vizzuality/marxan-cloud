import React from 'react';

import Wrapper from 'layout/wrapper';

export interface HomeSupportProps {

}

export const HomeSupport: React.FC<HomeSupportProps> = () => {
  return (
    <div className="py-10 bg-gray-800 md:py-32">
      <Wrapper>
        <p>Support</p>
      </Wrapper>
    </div>
  );
};

export default HomeSupport;
