import React from 'react';

import Wrapper from 'layout/wrapper';

import {
  FOUNDING_LOGOS, PARTNERSHIP_LOGOS, ADDITIONAL_SUPPORT_LOGOS, INITIATIVE_LOGOS,
} from './constants';

export interface PartnersListProps {

}

export const PartnersList: React.FC<PartnersListProps> = () => {
  return (
    <div className="py-24 bg-white">
      <Wrapper>
        <div className="space-y-32">

          <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
            <h2 className="pb-16 text-2xl leading-relaxed text-black font-heading max-w-max bg-clip-text">
              Brought to you by:
            </h2>
            <div className="grid w-full grid-cols-1 px-24 md:grid-cols-2 md:gap-y-96">
              {FOUNDING_LOGOS.map((fl) => (
                <a href={fl.hyperlink} key={fl.id} rel="noreferrer" target="_blank" className="place-self-center">
                  <img alt={fl.alt} src={fl.src} />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center w-full max-w-5xl pb-20 mx-auto">
            <h2 className="pb-16 text-2xl leading-relaxed text-black font-heading max-w-max bg-clip-text">
              In partnership with:
            </h2>
            <div className="grid w-full grid-cols-1 md:grid-cols-2 md:gap-y-96">
              {PARTNERSHIP_LOGOS.map((fl) => (
                <a href={fl.hyperlink} key={fl.id} rel="noreferrer" target="_blank" className="place-self-center">
                  <img alt={fl.alt} src={fl.src} />
                </a>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col items-center w-full max-w-5xl pb-20 mx-auto border-t border-black border-opacity-20">
            <div className="absolute flex justify-center h-10 bg-white -top-5">
              <h2 className="px-10 pb-20 text-2xl leading-relaxed text-black font-heading max-w-max bg-clip-text">
                With additional support from:
              </h2>
            </div>
            <div className="grid w-full grid-cols-1 pt-32 md:grid-cols-5 gap-y-24 md:gap-y-0 md:gap-x-16">
              {ADDITIONAL_SUPPORT_LOGOS.map((sl) => (
                <a href={sl.hyperlink} key={sl.id} rel="noreferrer" target="_blank" className="place-self-center">
                  <img alt={sl.alt} src={sl.src} />
                </a>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col items-center w-full max-w-5xl mx-auto border-t border-black border-opacity-20">
            <div className="absolute flex justify-center h-10 px-10 bg-white -top-5">
              <h2 className="pb-20 text-2xl leading-relaxed text-black font-heading max-w-max bg-clip-text">
                Supported by an initiative of the:
              </h2>
            </div>
            <div className="grid w-full grid-cols-1 pt-20 md:grid-cols-1 gap-x-16">
              {INITIATIVE_LOGOS.map((sl) => (
                <a href={sl.hyperlink} key={sl.id} rel="noreferrer" target="_blank" className="place-self-center">
                  <img alt={sl.alt} src={sl.src} />
                </a>
              ))}
            </div>
          </div>

        </div>
      </Wrapper>
    </div>
  );
};

export default PartnersList;
