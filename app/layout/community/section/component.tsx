import React from 'react';

import Button from 'components/button';
import Wrapper from 'layout/wrapper';

export interface CommunitySectionProps {

}

export const CommunitySection: React.FC<CommunitySectionProps> = () => {
  return (
    <Wrapper>
      <div className="flex flex-col items-center w-full max-w-5xl py-16 mx-auto gap-x-36 ">
        <div className="flex flex-col border-white border-opacity-20 w-96">
          <h4 className="mb-2">Reach out with comments or suggestions.</h4>
          <a className="text-left text-blue-500 underline" href="mailto:marxancloud@gmail.com">Contact us</a>
        </div>
      </div>
      <div className="flex flex-col items-center w-full max-w-5xl py-16 mx-auto border-t border-white gap-x-36 border-opacity-20">
        <div className="flex flex-col border-white border-opacity-20 w-96">
          <h4 className="mb-2">Follow us on twitter and join in the conversation.</h4>
          <a className="text-left text-blue-500 underline" href="https://twitter.com/marxan_planning?">@Marxan_Planning</a>
        </div>
      </div>
      <div className="flex flex-col items-center w-full max-w-5xl py-16 mx-auto border-t border-white gap-x-36 border-opacity-20">
        <div className="flex flex-col items-center border-white border-opacity-20 w-96">
          <h4>Sign up for our newsletter to receive highlights and updates.</h4>
          <div className="mt-10 w-36">
            <Button theme="primary" size="s" type="submit" className="w-full">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default CommunitySection;
