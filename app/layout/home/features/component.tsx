import React from 'react';

import { useInView } from 'react-intersection-observer';

import Link from 'next/link';

import { motion } from 'framer-motion';

import Item from 'layout/home/features/item';
import Wrapper from 'layout/wrapper';

import { FEATURES, EXAMPLE_PROJECTS } from './constants';

export interface HomeFeaturesProps {}

export const HomeFeatures: React.FC<HomeFeaturesProps> = () => {
  const { ref: exploreRef, inView: exploreInView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  const exampleProjectsVariants = {
    initial: (i: number) => ({
      x: i <= 1 ? 0 : -(i * 2),
      y: i === 0 ? 20 : i * 20,
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
      y: i === 0 ? 0 : i * 4,
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
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 sm:grid-cols-2 md:gap-20 lg:grid-cols-3">
            {FEATURES.map((F, i) => {
              const { id, name, description, icon } = F;

              return (
                <Item
                  key={`${id}`}
                  id={id}
                  name={name}
                  description={description}
                  icon={icon}
                  index={i}
                />
              );
            })}
            <motion.div
              ref={exploreRef}
              initial={{ opacity: 0, y: 15 }}
              animate={{
                opacity: exploreInView ? 1 : 0,
                y: exploreInView ? 0 : 15,
              }}
              transition={{
                duration: 0.35,
                delay: 0.1 * (FEATURES.length % 3),
                ease: 'easeInOut',
              }}
            >
              <motion.div
                className="relative w-full place-self-center overflow-hidden rounded-3xl pb-24 pt-11"
                style={{ background: 'linear-gradient(to right bottom, #4B48F5, #00BFFF)' }}
                initial="initial"
                whileHover="hover"
                animate="initial"
              >
                <Link href="/community/projects" legacyBehavior>
                  <p className="cursor-pointer px-9 font-heading text-2xl leading-10 hover:underline">
                    Explore and learn from planning examples around the world
                  </p>
                </Link>
                <div className="mt-10 w-full overflow-hidden">
                  {EXAMPLE_PROJECTS.map(({ id, image, alt }, index) => (
                    <div
                      key={id}
                      className="absolute bottom-0 left-1/2 w-full -translate-x-2/4 transform px-9"
                    >
                      <motion.img
                        className="max-h-32 w-full cursor-pointer lg:max-h-full"
                        alt={alt}
                        src={image}
                        custom={EXAMPLE_PROJECTS.length - index - 1}
                        variants={exampleProjectsVariants}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default HomeFeatures;
