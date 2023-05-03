import React from 'react';

import { useInView } from 'react-intersection-observer';

import { motion } from 'framer-motion';

import Item from 'layout/home/support/item';
import Wrapper from 'layout/wrapper';

import { PLANNING_PROBLEMS } from './constants';

export interface HomeSupportProps {}

export const HomeSupport: React.FC<HomeSupportProps> = () => {
  const { ref, inView } = useInView({
    threshold: 1,
    triggerOnce: true,
  });

  const { ref: barRef, inView: barInView } = useInView({
    threshold: 1,
    triggerOnce: true,
  });

  return (
    <div id="home-support-section" className="bg-gray-700">
      <div className="relative mx-auto w-full max-w-5xl py-24 md:py-44">
        <Wrapper>
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 15 }}
            animate={{
              opacity: inView ? 1 : 0,
              y: inView ? 0 : 15,
            }}
            transition={{
              duration: 0.35,
              ease: 'easeInOut',
            }}
          >
            <h3 className="font-heading text-2xl text-white md:text-4xl">
              Types of planning problems that
              <br />
              <span className="text-primary-500">Marxan can support:</span>
            </h3>
          </motion.div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-x-44 gap-y-10 pt-24 md:grid-cols-2">
            {PLANNING_PROBLEMS.map((P) => {
              const { id, text, image } = P;

              return <Item key={id} id={id} text={text} image={image} />;
            })}
          </div>
        </Wrapper>

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
          className="absolute bottom-0 left-1/2 h-px w-full -translate-x-1/2 transform opacity-20"
          style={{ background: 'linear-gradient(to right, transparent, #ffffff, transparent)' }}
        />
      </div>
    </div>
  );
};

export default HomeSupport;
