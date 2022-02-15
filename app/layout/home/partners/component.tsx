import React from 'react';

import Wrapper from 'layout/wrapper';

import Carousel from 'components/carousel';

import { PARTNER_LOGOS } from './constants';

export interface PartnersListProps {

}

export const PartnersList: React.FC<PartnersListProps> = () => {
  return (
    <div className="relative border-t border-white bg-primary-50">
      <Wrapper>

        <div className="top-0 w-full h-px max-w-5xl mx-auto opacity-20" style={{ background: 'linear-gradient(to right, transparent, #000000, transparent)' }} />

        <div className="max-w-5xl pt-24 pb-6 mx-auto">
          <Carousel
            slides={PARTNER_LOGOS.map((pl) => {
              const { id, title, logos } = pl;
              return {
                id,
                content: (
                  <>
                    <p className="text-lg text-black md:text-2xl font-heading">
                      {title}
                    </p>
                    <div className="grid w-full grid-cols-1 md:grid-cols-4 py-14 md:gap-y-0 gap-y-36 md:gap-x-20">
                      {logos.map((logo) => {
                        const {
                          id: logoId, alt, hyperlink, src,
                        } = logo;
                        return (
                          <a href={hyperlink} key={logoId} rel="noreferrer" target="_blank" className="w-4/5 md:w-full">
                            <img className="md:max-h-12" alt={alt} src={src} height="auto" width="auto" />
                          </a>
                        );
                      })}
                    </div>
                  </>
                ),
              };
            })}
          />
        </div>
      </Wrapper>

    </div>
  );
};

export default PartnersList;
