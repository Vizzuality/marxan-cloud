import React from 'react';

import Wrapper from 'layout/wrapper';

import { FOUNDING_LOGOS/* , SUPPORTING_LOGOS */ } from './constants';

export interface PartnersListProps {

}

export const PartnersList: React.FC<PartnersListProps> = () => {
  return (
    <div className="bg-white">
      <Wrapper>
        <div className="flex flex-col items-center w-full max-w-5xl py-12 mx-auto">
          <h2 className="pb-20 text-2xl leading-relaxed text-black font-heading max-w-max bg-clip-text">
            Founding partners:
          </h2>
          <div className="grid w-full grid-cols-3 gap-x-56">
            {FOUNDING_LOGOS.map((fl) => (
              <img alt={fl.alt} key={fl.id} src={fl.src} />
            ))}
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default PartnersList;
