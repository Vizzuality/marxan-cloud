import React, { Children } from 'react';

import Wrapper from 'layout/wrapper';

import { UTILITIES } from './constants';

export interface AboutUtilitiesProps {

}

export const AboutUtilities: React.FC<AboutUtilitiesProps> = () => {
  return (
    <Wrapper>
      <div className="grid w-full max-w-5xl grid-cols-2 gap-24 py-16 mx-auto border-t border-opacity-80">
        <div>
          <h2 className="pb-10 text-4xl text-transparent font-heading max-w-max bg-gradient-to-r from-purple-500 to-green-400 bg-clip-text leading-extra-loose">
            What can I do with this
            <br />
            Marxan planning platform?
          </h2>
        </div>
        <div className="flex flex-col items-start gap-10">
          {Children.toArray(
            UTILITIES.map((u) => (
              <div className="flex flex-row gap-16" key={u.order}>
                <p className="text-2xl font-semibold text-gray-600">{u.order}</p>
                <p className="text-lg font-heading">{u.description}</p>
              </div>
            )),
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default AboutUtilities;
