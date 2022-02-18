import React from 'react';

import { useInView } from 'react-intersection-observer';

import { AnimatePresence, motion } from 'framer-motion';

import Wrapper from 'layout/wrapper';

import { PLANNING_PROBLEMS } from './constants';

export interface HomeSupportProps {

}

export const HomeSupport: React.FC<HomeSupportProps> = () => {
  const { ref, inView } = useInView({
    threshold: 0,
  });

  console.log({ inView });

  return (
    <div
      ref={ref}
      id="home-support-section"
      className="bg-gray-700"
    >
      <Wrapper>
        <AnimatePresence>
          <motion.div
            id="overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: inView ? 1 : 0,
              transition: {
                delay: 2,
              },
            }}
            exit={{
              opacity: 0,
              transition: {
                delay: 0.125,
              },
            }}
            className="relative w-full max-w-5xl py-24 mx-auto md:py-44"
          >

            <h3 className="text-2xl text-white md:text-4xl font-heading">
              Types of planning problems that
              {' '}
              <span className="text-primary-500">Marxan can support:</span>
            </h3>

            <div className="grid max-w-5xl grid-cols-1 pt-24 mx-auto md:grid-cols-2 gap-y-10 gap-x-44">
              {PLANNING_PROBLEMS.map((P) => {
                const { id, text, image } = P;

                return (
                  <div key={`${id}`} className="flex items-center space-x-6">
                    <img alt={text} src={image} />
                    <p className="text-lg text-white">{text}</p>
                  </div>
                );
              })}
            </div>
            <div className="absolute bottom-0 w-full h-px opacity-20" style={{ background: 'linear-gradient(to right, transparent, #ffffff, transparent)' }} />
          </motion.div>
        </AnimatePresence>
      </Wrapper>
    </div>
  );
};

export default HomeSupport;
