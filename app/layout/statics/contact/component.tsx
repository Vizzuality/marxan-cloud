import React from 'react';

import Button from 'components/button';
import Wrapper from 'layout/wrapper';

export interface StaticContactProps {}

export const StaticContact: React.FC<StaticContactProps> = () => {
  return (
    <div className="bg-primary-500">
      <Wrapper>
        <div className="mx-auto w-full max-w-5xl py-32">
          <p className="mb-4 max-w-3xl font-heading text-4xl text-black">
            Questions, comments, or feedback?
          </p>
          <p className="mb-14 max-w-3xl font-heading text-4xl text-black">
            Help us strengthen Marxan.
          </p>
          <div className="w-44">
            <Button
              href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
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
