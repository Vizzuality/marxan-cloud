import React, { useMemo } from 'react';

import { useInView } from 'react-intersection-observer';

import { motion } from 'framer-motion';

import Carousel from 'components/carousel';
import { Media } from 'layout/media';
import Wrapper from 'layout/wrapper';

import { PARTNER_LOGOS } from './constants';

export interface PartnersListProps {}

export const PartnersList: React.FC<PartnersListProps> = () => {
  const { ref: desktopRef, inView: desktopInView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });
  const { ref: mobileRef, inView: mobileInView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });
  const { ref: barRef, inView: barInView } = useInView({
    threshold: 1,
    triggerOnce: true,
  });

  const renderLogoSections = useMemo(() => {
    return PARTNER_LOGOS.map((pl) => {
      const { id, title, logos } = pl;
      return {
        id,
        content: (
          <div key={id} className="flex flex-col md:space-y-0">
            <p className="text-center font-heading text-lg text-black md:text-left md:text-2xl">
              {title}
            </p>
            <div className="grid w-full grid-cols-1 gap-y-8 pt-5 md:grid-cols-4 md:gap-x-20 md:gap-y-0 md:py-14">
              {logos.map((logo) => {
                const { id: logoId, alt, hyperlink, src } = logo;
                return (
                  <a
                    href={hyperlink}
                    key={logoId}
                    rel="noreferrer"
                    target="_blank"
                    className="m-auto md:w-full"
                    style={{ maxWidth: 150 }}
                  >
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
        <motion.div
          ref={barRef}
          initial={{ width: 0 }}
          animate={{
            width: barInView ? '100%' : 0,
          }}
          transition={{
            duration: 0.75,
            ease: 'easeInOut',
          }}
          className="absolute left-1/2 top-0 mx-auto h-px w-full max-w-5xl -translate-x-1/2 transform opacity-20"
          style={{ background: 'linear-gradient(to right, transparent, #000000, transparent)' }}
        />

        <Media greaterThanOrEqual="md">
          <motion.div
            ref={desktopRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: desktopInView ? 1 : 0 }}
            transition={{
              duration: 1,
              ease: 'easeInOut',
            }}
          >
            <div className="mx-auto max-w-5xl pb-6 pt-24">
              <Carousel slides={renderLogoSections} />
            </div>
          </motion.div>
        </Media>

        <Media lessThan="md">
          <motion.div
            ref={mobileRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: mobileInView ? 1 : 0 }}
            transition={{
              duration: 1,
              ease: 'easeInOut',
            }}
          >
            <div className="mx-auto max-w-5xl space-y-16 py-10">
              {renderLogoSections.map((ls) => ls.content)}
            </div>
          </motion.div>
        </Media>
      </Wrapper>
    </div>
  );
};

export default PartnersList;
