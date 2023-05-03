import React from 'react';

import Column from 'layout/statics/column';
import Wrapper from 'layout/wrapper';

import BackgroundImage from 'images/about/bg-utilities.jpg';
import UtilitiesImage from 'images/about/utilities-1.png';

import { UTILITIES } from './constants';

export interface AboutUtilitiesProps {}

export const AboutUtilities: React.FC<AboutUtilitiesProps> = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: 'cover',
      }}
    >
      <Wrapper>
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-x-36 border-t border-white border-opacity-20 py-28">
          <Column
            title="What can I do with this Marxan planning platform?"
            image={UtilitiesImage}
          />
          <div className="flex flex-col items-start gap-10">
            {UTILITIES.map((u) => (
              <div className="flex flex-row gap-16" key={u.order}>
                <p className="text-2xl font-semibold text-primary-500">{u.order}</p>
                <p className="font-heading text-lg">{u.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default AboutUtilities;
