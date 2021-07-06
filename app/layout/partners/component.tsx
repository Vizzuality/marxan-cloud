import React from 'react';

import Wrapper from 'layout/wrapper';

import { FOUNDING_LOGOS, SUPPORTING_LOGOS } from './constants';

export interface PartnersListProps {

}

export const PartnersList: React.FC<PartnersListProps> = () => {
  return (
    <div className="bg-white">
      <Wrapper>
        <div className="flex flex-col items-center w-full max-w-5xl pt-12 pb-40 mx-auto">
          <h2 className="pb-20 text-2xl leading-relaxed text-black font-heading max-w-max bg-clip-text">
            Founding partners:
          </h2>
          <div className="grid w-full grid-cols-1 py-10 md:grid-cols-3 gap-x-56 gap-y-24">
            {FOUNDING_LOGOS.map((fl) => (
              <a href={fl.hyperlink} key={fl.id} rel="noreferrer" target="_blank" className="place-self-center">
                <img alt={fl.alt} src={fl.src} />
              </a>
            ))}
          </div>
        </div>
        <div className="relative flex flex-col items-center w-full max-w-5xl pt-24 pb-20 mx-auto border-t border-black border-opacity-20">
          <div className="absolute flex justify-center h-10 bg-white w-80 -top-5">
            <h2 className="pb-20 text-2xl leading-relaxed text-black font-heading max-w-max bg-clip-text">
              Supporting partners:
            </h2>
          </div>
          <div className="grid w-full grid-cols-1 py-10 md:grid-cols-3 gap-x-56 gap-y-24">
            {SUPPORTING_LOGOS.map((sl) => (
              <a href={sl.hyperlink} key={sl.id} rel="noreferrer" target="_blank" className="place-self-center">
                <img alt={sl.alt} src={sl.src} />
              </a>
            ))}
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default PartnersList;
