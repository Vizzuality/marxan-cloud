import React from 'react';

import Button from 'components/button';
import Column from 'layout/statics/column';
import Wrapper from 'layout/wrapper';

export interface CommunityInfoProps {

}

export const CommunityInfo: React.FC<CommunityInfoProps> = () => {
  return (
    <Wrapper>
      <div className="grid w-full max-w-5xl grid-cols-2 py-16 mx-auto border-t border-white gap-x-36 border-opacity-20">
        <Column
          title="Explore the projects shared by the community"
          subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."
          caption="Explore projects"
          href="/community/projects"
        />
        <Column
          title="Join the community and stay updated"
          subtitle="Receive the latest Marxan updates and connect with other users to mobilize for action."
          description="Have questions about Marxan or suggestions for how to strengthen the platform? How about an idea for a bold new partnership around data use? We want to hear from you. Join us in the movement to build a more sustainable future."
          caption="Learn more"
          href="https://groups.google.com/g/marxan"
          external
        />
      </div>
      <div className="flex flex-col items-center w-full max-w-5xl py-16 mx-auto gap-x-36 ">
        <div className="flex flex-col border-white border-opacity-20 w-96">
          <h4 className="mb-2">Reach out with comments or suggestions.</h4>
          <a className="text-left text-blue-500 underline" href="mailto:marxancloud@gmail.com" rel="noopener noreferrer" target="_blank">Contact us</a>
        </div>
      </div>
      <div className="flex flex-col items-center w-full max-w-5xl py-16 mx-auto border-t border-white gap-x-36 border-opacity-20">
        <div className="flex flex-col border-white border-opacity-20 w-96">
          <h4 className="mb-2">Follow us on twitter and join in the conversation.</h4>
          <a className="text-left text-blue-500 underline" href="https://twitter.com/marxan_planning?" rel="noopener noreferrer" target="_blank">@Marxan_Planning</a>
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

export default CommunityInfo;
