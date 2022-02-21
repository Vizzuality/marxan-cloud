import React from 'react';

import { useInView } from 'react-intersection-observer';

import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';

import Wrapper from 'layout/wrapper';

import Icon from 'components/icon';

import { FEATURES, EXAMPLE_PROJECTS } from './constants';

export interface HomeFeaturesProps {

}

export const HomeFeatures: React.FC<HomeFeaturesProps> = () => {
  const { ref, inView } = useInView({
    threshold: 0.4,
    triggerOnce: true,
  });

  const exampleProjectsVariants = {
    initial: (i: number) => ({
      x: (i <= 1) ? 0 : -(i * 2),
      y: (i === 0) ? 20 : (i * 20),
      rotate: 0,
      originX: 1,
      originY: 1,
      transition: {
        duration: 0.25,
        ease: 'easeInOut',
      },
    }),
    hover: (i: number) => ({
      x: -(i * 10),
      y: (i === 0) ? 0 : i * 4,
      rotate: -(i * 4),
      originX: 1,
      originY: 1,
      transition: {
        duration: 0.25,
        ease: 'easeInOut',
      },
    }),
  };

  return (
    <div className="bg-primary-50">
      <Wrapper>
        <div className="w-full py-10 md:py-32 ">
          <div ref={ref}>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: inView ? 1 : 0 }}
                transition={{
                  duration: 0.35,
                  ease: 'easeInOut',
                }}
                exit={{ opacity: 0 }}
              >
                <div className="grid max-w-5xl grid-cols-1 gap-10 mx-auto md:gap-20 sm:grid-cols-2 lg:grid-cols-3">
                  {FEATURES.map((F) => {
                    const {
                      id, name, description, icon,
                    } = F;

                    return (
                      <div key={`${id}`}>
                        <Icon icon={icon} className="w-16 h-16" />
                        <h2 className="mt-2.5 mb-2.5 md:mt-6 md:mb-10 text-2xl font-medium text-gray-800 font-heading">{name}</h2>
                        <p className="text-gray-400">{description}</p>
                      </div>
                    );
                  })}
                  <motion.div
                    className="relative w-full pb-24 overflow-hidden pt-11 place-self-center rounded-3xl"
                    style={{ background: 'linear-gradient(to right bottom, #4B48F5, #00BFFF)' }}
                    initial="initial"
                    whileHover="hover"
                    animate="initial"
                  >
                    <Link href="/community/projects">
                      <p className="text-2xl leading-10 cursor-pointer font-heading px-9 hover:underline">
                        Explore planning examples from around the world and learn
                      </p>
                    </Link>
                    <div className="w-full mt-10 overflow-hidden">
                      {EXAMPLE_PROJECTS.map(({
                        id, image, alt,
                      }, index) => (
                        <div key={id} className="absolute bottom-0 w-full transform px-9 left-1/2 -translate-x-2/4">
                          <motion.img
                            className="w-full cursor-pointer max-h-32 lg:max-h-full"
                            alt={alt}
                            src={image}
                            custom={EXAMPLE_PROJECTS.length - index - 1}
                            variants={exampleProjectsVariants}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default HomeFeatures;
