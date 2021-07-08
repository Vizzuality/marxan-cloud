import React from 'react';

import Column from 'layout/statics/column';
import Wrapper from 'layout/wrapper';

import { UTILITIES } from './constants';

export interface AboutUtilitiesProps {

}

export const AboutUtilities: React.FC<AboutUtilitiesProps> = () => {
  return (
    <Wrapper>
      <div className="grid w-full max-w-5xl grid-cols-2 py-16 mx-auto border-t border-white gap-x-36 border-opacity-20">
        <Column
          title="What can I do with this Marxan planning platform?"
          subtitle="This platform hosts the Marxan software suite which includes Marxan, Marxan with Zones, and Marxan with Connectivity on a stable Azure cloud environment. You can use this platform to:"
          caption="Learn more"
          href="https://marxansolutions.org"
          external
        />
        <div className="flex flex-col items-start gap-10">
          {UTILITIES.map((u) => (
            <div className="flex flex-row gap-16" key={u.order}>
              <p className="text-2xl font-semibold text-gray-600">{u.order}</p>
              <p className="text-lg font-heading">{u.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Wrapper>
  );
};

export default AboutUtilities;
