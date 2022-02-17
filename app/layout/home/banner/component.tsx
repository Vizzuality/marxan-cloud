import React from 'react';

import Wrapper from 'layout/wrapper';

import BANNER_1_IMG from 'images/home/banner/banner-1.png';
import BANNER_2_IMG from 'images/home/banner/banner-2.png';
import BANNER_3_IMG from 'images/home/banner/banner-3.png';
import BANNER_BACKGROUND from 'images/home/banner/banner-background.png';

export interface HomeBannerProps {

}

const claimLines = [{ id: '0', text: 'free and open' }, { id: '1', text: 'flexible' }, { id: '2', text: 'efficient & repitable' }];

export const HomeBanner: React.FC<HomeBannerProps> = () => {
  return (
    <div className="py-10 md:py-32" style={{ background: 'radial-gradient(circle at 50% 70%, rgba(54,55,62,1) 0%, rgba(21,21,21,1) 51%)' }}>

      <Wrapper>
        <div className="flex flex-col items-center -space-y-20 md:space-y-20">
          <div>
            <h5 className="text-5xl text-center md:text-left md:text-6xl leading-14 md:leading-10 font-heading">Marxan software is</h5>
            <div
              className="relative h-52 md:h-40"
              style={{ clipPath: 'polygon(0 5%, 100% 5%, 100% 45%, 0 45%)' }}
            >
              <div className="absolute flex flex-col items-center w-full max-w-4xl mt-5 animate-banner text-primary-500">
                {!!claimLines.length && claimLines.map((cl) => (
                  <p className="text-4xl text-center md:text-left mb-18 md:mb-16 md:text-5xl" key={cl.id}>{cl.text}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="relative grid justify-between w-full grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-y-0 md:gap-x-6">
            <div
              className="absolute hidden w-full h-full bg-no-repeat opacity-50 -top-10 md:-top-20 -left-10 md:-left-18 bg-gradient-to-b from-current to-transparent lg:block"
              style={{
                backgroundImage: `url(${BANNER_BACKGROUND})`,
                backgroundSize: '34%',
              }}
            />

            <img alt="Scenario features example" src={BANNER_1_IMG} />
            <img alt="Scenario map layers example" src={BANNER_2_IMG} />
            <img alt="Scenarios tags examples" src={BANNER_3_IMG} className="md:pt-12" />

          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default HomeBanner;
