import React from 'react';

import Wrapper from 'layout/wrapper';

export interface AboutUtilitiesProps {

}

export const AboutUtilities: React.FC<AboutUtilitiesProps> = () => {
  return (
    <Wrapper>
      <div className="grid w-full max-w-5xl grid-cols-2 gap-24 py-32 mx-auto border-t border-opacity-80">
        <div>
          <h2 className="pb-10 text-3xl leading-tight text-transparent font-heading max-w-max bg-gradient-to-r from-purple-500 to-green-400 bg-clip-text">
            What can I do with this Marxan
            <br />
            planning platform?
          </h2>
        </div>
        <div>
          Column 2
        </div>
      </div>
    </Wrapper>
  );
};

export default AboutUtilities;
