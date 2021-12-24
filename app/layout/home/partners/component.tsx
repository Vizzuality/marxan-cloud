import React from 'react';

import Wrapper from 'layout/wrapper';

import {
  FOUNDING_LOGOS, PARTNERSHIP_LOGOS, ADDITIONAL_SUPPORT_LOGOS, INITIATIVE_LOGOS,
} from './constants';

export interface PartnersListProps {

}

export const PartnersList: React.FC<PartnersListProps> = () => {
  return (
    <div className="relative pt-4 pb-24 text-base text-gray-800 bg-blue-500">
      <Wrapper>
        <div className="space-y-32 md:space-y-20">
          <div className="absolute w-screen h-px top-2/4 bg-gradient-to-r from-gray-200 opacity-20 to-gray-200 via-black" />

          <div className="flex flex-col w-full max-w-5xl mx-auto">
            <h2 className="pb-10 leading-relaxed text-center md:pb-6 md:text-left bg-clip-text">
              In partnership with:
            </h2>
            <div className="grid w-full grid-cols-1 md:grid-cols-7 gap-y-20 gap-x-20">
              {FOUNDING_LOGOS.map((fl) => (
                <a href={fl.hyperlink} key={fl.id} rel="noreferrer" target="_blank" className="col-span-2 place-self-center md:place-self-start">
                  <img alt={fl.alt} src={fl.src} height="auto" width="auto" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col w-full max-w-5xl pb-20 mx-auto">
            <h2 className="pb-10 leading-relaxed text-center md:pb-6 bg-clip-text md:text-left">
              In partnership with:
            </h2>
            <div className="grid w-full grid-cols-1 md:grid-cols-4 gap-y-24 md:gap-y-0 md:gap-x-20">
              {PARTNERSHIP_LOGOS.map((fl) => (
                <a href={fl.hyperlink} key={fl.id} rel="noreferrer" target="_blank" className="place-self-center md:place-self-start">
                  <img alt={fl.alt} src={fl.src} height="auto" width="auto" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col w-full max-w-5xl pt-10 mx-auto md:pt-20">
            <h2 className="pb-10 leading-relaxed text-center md:pb-6 bg-clip-text md:text-left">
              With additional support from:
            </h2>
            <div className="grid w-full grid-cols-1 md:grid-cols-4 gap-y-24 md:gap-y-0 md:gap-x-20">
              {ADDITIONAL_SUPPORT_LOGOS.map((sl) => (
                <a href={sl.hyperlink} key={sl.id} rel="noreferrer" target="_blank" className="place-self-center md:place-self-start">
                  <img alt={sl.alt} src={sl.src} height="auto" width="auto" />
                </a>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col w-full max-w-5xl mx-auto">
            <h2 className="pb-10 leading-relaxed text-center md:pb-6 bg-clip-text md:text-left">
              Supported by an initiative of the:
            </h2>
            <div className="grid w-full grid-cols-1 md:grid-cols-4">
              {INITIATIVE_LOGOS.map((sl) => (
                <a href={sl.hyperlink} key={sl.id} rel="noreferrer" target="_blank" className="place-self-center md:place-self-start">
                  <img alt={sl.alt} src={sl.src} height="auto" width="auto" />
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
