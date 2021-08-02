import React from 'react';

import ButtonLink from 'layout/statics/button-link';
import Wrapper from 'layout/wrapper';

import Icon from 'components/icon';

import { FEATURES } from './constants';

export interface HomeFeaturesProps {

}

export const HomeFeatures: React.FC<HomeFeaturesProps> = () => {
  return (
    <div className="bg-white">
      <Wrapper>
        <div className="w-full py-32">
          <div className="grid max-w-5xl grid-cols-1 gap-20 mx-auto sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((F) => {
              const {
                id, name, description, icon, iconClassName,
              } = F;

              return (
                <div key={`${id}`}>
                  <div className="flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl">
                    <Icon icon={icon} className={iconClassName} />
                  </div>
                  <h2 className="mt-6 mb-10 text-gray-800 text-2xl font-medium font-heading">{name}</h2>
                  <p className="text-gray-300">{description}</p>
                </div>
              );
            })}
            <div className="w-full mt-20 place-self-center">
              {/* <Link href="/community/projects">
                <a href="/community/projects" className="mt-2">
                  Explore planning Examples
                </a>
              </Link> */}
              <ButtonLink caption="Explore planning Examples" href="/community/projects" />
            </div>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default HomeFeatures;
