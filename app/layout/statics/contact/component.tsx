import React from 'react';

import Wrapper from 'layout/wrapper';

import Button from 'components/button';

export interface StaticContactProps {

}

export const StaticContact: React.FC<StaticContactProps> = () => {
  return (
    <div className="bg-primary-500">
      <Wrapper>
        <div className="w-full max-w-5xl py-32 mx-auto">
          <p className="max-w-3xl mb-4 text-4xl text-black font-heading">
            Questions, comments, or feedback?
          </p>
          <p className="max-w-3xl text-4xl text-black mb-14 font-heading">
            Help us strengthen Marxan.
          </p>
          <div className="w-44">
            <Button
              href="mailto:marxancloud@gmail.com"
              size="lg"
              target="_blank"
              theme="transparent-black"
              type="submit"
              className="w-full"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default StaticContact;
