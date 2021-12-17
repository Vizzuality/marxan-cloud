import React from 'react';

import Wrapper from 'layout/wrapper';

export interface HomeBannerProps {

}

const claimLines = [{ id: '0', text: 'free and open' }, { id: '1', text: 'flexible' }, { id: '2', text: 'efficient & repitable' }];

export const HomeBanner: React.FC<HomeBannerProps> = () => {
  return (
    <div
      className="pt-10 -mx-10 h-96 md:py-0 md:mx-0"
    >
      <Wrapper>
        <div className="flex flex-col w-full max-w-4xl m-auto md:px-10 md:-top-8" style={{ animation: 'slider 6s linear infinite' }}>
          {!!claimLines.length && claimLines.map((cl) => (
            <p key={cl.id}>{cl.text}</p>
          ))}
        </div>
      </Wrapper>
    </div>
  );
};

export default HomeBanner;
