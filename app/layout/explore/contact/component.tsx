import React from 'react';

import Button from 'components/button';
import Wrapper from 'layout/wrapper';

export interface ExploreContactProps {

}

export const ExploreContact: React.FC<ExploreContactProps> = () => {
  return (
    <div className="bg-primary-500">
      <Wrapper>
        <div className="w-full max-w-5xl py-32 mx-auto">
          <p className="max-w-3xl mb-2 text-4xl text-black">
            Questions, comments, or feedback?
          </p>
          <p className="max-w-3xl text-4xl text-black mb-14">
            Help us strengthen Marxan.
          </p>
          <div className="w-44">
            <Button theme="primary" size="lg" type="submit" className="w-full">
              Contact Us
            </Button>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default ExploreContact;
