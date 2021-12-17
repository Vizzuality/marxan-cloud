import React from 'react';

import Wrapper from 'layout/wrapper';

import {
  FOUNDING_LOGOS, PARTNERSHIP_LOGOS, ADDITIONAL_SUPPORT_LOGOS, INITIATIVE_LOGOS,
} from './constants';

export interface PartnersListProps {

}

export const PartnersList: React.FC<PartnersListProps> = () => {
  return (
    <div className="relative py-24 text-base text-gray-800 bg-blue-500">
      <div className="absolute w-screen h-px top-2/4 bg-gradient-to-r from-gray-200 opacity-20 to-gray-200 via-black" />

      <Wrapper>
        <div className="space-y-20">

          <div className="flex flex-col w-full max-w-5xl mx-auto">
            <h2 className="pb-6 leading-relaxed bg-clip-text">
              In partnership with:
            </h2>
            <div className="grid w-full grid-cols-1 md:grid-cols-4 gap-y-20">
              {FOUNDING_LOGOS.map((fl) => (
                <a href={fl.hyperlink} key={fl.id} rel="noreferrer" target="_blank">
                  <img alt={fl.alt} src={fl.src} height="auto" width="auto" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col w-full max-w-5xl pb-20 mx-auto">
            <h2 className="pb-6 leading-relaxed bg-clip-text">
              In partnership with:
            </h2>
            <div className="grid w-full grid-cols-1 md:grid-cols-4 gap-y-20">
              {PARTNERSHIP_LOGOS.map((fl) => (
                <a href={fl.hyperlink} key={fl.id} rel="noreferrer" target="_blank">
                  <img alt={fl.alt} src={fl.src} height="auto" width="auto" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col w-full max-w-5xl pt-20 mx-auto">
            <h2 className="pb-6 leading-relaxed bg-clip-text">
              With additional support from:
            </h2>
            <div className="grid w-full grid-cols-1 md:grid-cols-4 gap-y-24 md:gap-y-0 md:gap-x-20">
              {ADDITIONAL_SUPPORT_LOGOS.map((sl) => (
                <a href={sl.hyperlink} key={sl.id} rel="noreferrer" target="_blank" className="place-self-center">
                  <img alt={sl.alt} src={sl.src} height="auto" width="auto" />
                </a>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col w-full max-w-5xl mx-auto">
            <h2 className="pb-6 leading-relaxed bg-clip-text">
              Supported by an initiative of the:
            </h2>
            <div className="grid w-full grid-cols-1">
              {INITIATIVE_LOGOS.map((sl) => (
                <a href={sl.hyperlink} key={sl.id} rel="noreferrer" target="_blank">
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
