import React, { useMemo } from 'react';

import { useInView } from 'react-intersection-observer';

import { AnimatePresence, motion } from 'framer-motion';

import { Media } from 'layout/media';
import Wrapper from 'layout/wrapper';

import Carousel from 'components/carousel';

import { PARTNER_LOGOS } from './constants';

export interface PartnersListProps {

}

export const PartnersList: React.FC<PartnersListProps> = () => {
  const { ref: desktopRef, inView: desktopInView } = useInView({});
  const { ref: mobileRef, inView: mobileInView } = useInView({});

  const renderLogoSections = useMemo(() => {
    return PARTNER_LOGOS.map((pl) => {
      const { id, title, logos } = pl;
      return {
        id,
        content: (
          <div className="flex flex-col md:space-y-0">
            <p className="text-lg text-center text-black md:text-left md:text-2xl font-heading">
              {title}
            </p>
            <div className="grid w-full grid-cols-1 pt-5 md:py-14 md:grid-cols-4 md:gap-y-0 gap-y-8 md:gap-x-20">
              {logos.map((logo) => {
                const {
                  id: logoId, alt, hyperlink, src,
                } = logo;
                return (
                  <a href={hyperlink} key={logoId} rel="noreferrer" target="_blank" className="m-auto md:w-full" style={{ maxWidth: 150 }}>
                    <img className="md:max-h-12" alt={alt} src={src} height="auto" width="auto" />
                  </a>
                );
              })}
            </div>
          </div>
        ),
      };
    });
  }, []);

  return (
    <div className="relative border border-t border-white bg-primary-50">
      <Wrapper>

        <div className="top-0 w-full h-px max-w-5xl mx-auto opacity-20" style={{ background: 'linear-gradient(to right, transparent, #000000, transparent)' }} />

        <Media greaterThanOrEqual="md">
          <div ref={desktopRef}>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: desktopInView ? 1 : 0 }}
                transition={{ delay: 0.4 }}
                exit={{ opacity: 0 }}
              >
                <div className="max-w-5xl pt-24 pb-6 mx-auto">
                  <Carousel
                    slides={renderLogoSections}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Media>

        <Media lessThan="md">
          <div ref={mobileRef}>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: mobileInView ? 1 : 0 }}
                transition={{ delay: 0.35 }}
                exit={{ opacity: 0 }}
              >
                <div className="max-w-5xl py-10 mx-auto space-y-16">
                  {renderLogoSections.map((ls) => ls.content)}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Media>
      </Wrapper>

    </div>
  );
};

export default PartnersList;
