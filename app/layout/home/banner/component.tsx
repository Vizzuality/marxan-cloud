import React from 'react';

import { useInView } from 'react-intersection-observer';

import { motion } from 'framer-motion';

import Wrapper from 'layout/wrapper';

export interface HomeBannerProps {

}

const claimLines = [{ id: '0', text: 'free & open-source' }, { id: '1', text: 'transparent' }, { id: '2', text: 'repeatable' }];

export const HomeBanner: React.FC<HomeBannerProps> = () => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });
  const { ref: imagesRef, inView: imagesInView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  return (
    <div className="py-10 md:py-32" style={{ background: 'radial-gradient(circle at 50% 70%, rgba(54,55,62,1) 0%, rgba(21,21,21,1) 51%)' }}>
      <Wrapper>
        <div className="flex flex-col items-center -space-y-20 md:space-y-20">
          <div ref={ref}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{
                duration: 1,
              }}
            >
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
            </motion.div>
          </div>

          <div ref={imagesRef}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: imagesInView ? 1 : 0 }}
              transition={{
                duration: 1,
              }}
            >
              <div className="relative grid justify-between w-full grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-y-0 md:gap-x-6">
                <img alt="Scenario features example" src="/images/home/banner/banner-1.png" />
                <img alt="Scenario map layers example" src="/images/home/banner/banner-2.png" />
                <img alt="Scenarios tags examples" src="/images/home/banner/banner-3.png" className="md:pt-12" />
              </div>
            </motion.div>
          </div>
        </div>

      </Wrapper>
    </div>
  );
};

export default HomeBanner;
