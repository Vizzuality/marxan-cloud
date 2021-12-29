import React from 'react';

import Wrapper from 'layout/wrapper';

import { PARTNER_LOGOS } from './constants';

export interface PartnersListProps {

}

export const PartnersList: React.FC<PartnersListProps> = () => {
  return (
    <div className="relative py-10 md:py-24 text-base text-gray-800 bg-blue-500">
      <Wrapper>
        <div className="space-y-16 md:space-y-20">
          {PARTNER_LOGOS.map((section) => (
            section.separator ? (
              <div className="w-screen h-px bg-gradient-to-r from-gray-200 opacity-20 to-gray-200 via-black" />
            ) : (
              <div key={section.id} className="flex flex-col w-full max-w-5xl mx-auto">
                <h2 className="pb-10 leading-relaxed text-center md:pb-6 md:text-left bg-clip-text">
                  {section.title}
                </h2>
                <div className="grid w-full grid-cols-1 md:grid-cols-8 gap-y-10 md:gap-y-20 gap-x-20">
                  {section.logos.map((logo) => (
                    <a href={logo.hyperlink} key={logo.id} rel="noreferrer" target="_blank" className="col-span-2 place-self-center md:place-self-start">
                      <img className="max-h-12" alt={logo.alt} src={logo.src} height="auto" width="auto" />
                    </a>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </Wrapper>
    </div>
  );
};

export default PartnersList;
