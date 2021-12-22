import React from 'react';

import Link from 'next/link';

import Wrapper from 'layout/wrapper';

import Icon from 'components/icon';

import PROJECT_FEATURES_PNG from 'images/home-features/project-features.png';

import { FEATURES } from './constants';

export interface HomeFeaturesProps {

}

export const HomeFeatures: React.FC<HomeFeaturesProps> = () => {
  return (
    <div className="bg-primary-50">
      <Wrapper>
        <div className="w-full py-10 md:py-32">
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
            <div
              className="w-full pt-11 place-self-center rounded-3xl"
              style={{ background: 'linear-gradient(to right bottom, #4B48F5, #00BFFF)' }}
            >
              <Link href="/community/projects">
                <p className="text-2xl leading-10 cursor-pointer font-heading mb-14 px-9 hover:underline">
                  Explore
                  <br />
                  planning
                  <br />
                  examples
                </p>
              </Link>
              <img alt="Project Kenya features example" src={PROJECT_FEATURES_PNG} className="w-full -ml-2" />
            </div>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default HomeFeatures;
