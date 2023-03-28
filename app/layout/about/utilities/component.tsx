import React from 'react';

import Column from 'layout/statics/column';
import Wrapper from 'layout/wrapper';

import { UTILITIES } from './constants';

export interface AboutUtilitiesProps {

}

export const AboutUtilities: React.FC<AboutUtilitiesProps> = () => {
  return (
    <div
      style={{
        backgroundImage: 'url(/images/about/bg-utilities.jpg)',
        backgroundSize: 'cover',
      }}
    >
      <Wrapper>
        <div className="grid w-full max-w-5xl grid-cols-2 mx-auto border-t border-white py-28 gap-x-36 border-opacity-20">
          <Column
            title="What can I do with this Marxan planning platform?"
            image="/images/about/utilities-1.png"
          />
          <div className="flex flex-col items-start gap-10">
            {UTILITIES.map((u) => (
              <div className="flex flex-row gap-16" key={u.order}>
                <p className="text-2xl font-semibold text-primary-500">{u.order}</p>
                <p className="text-lg font-heading">{u.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default AboutUtilities;
