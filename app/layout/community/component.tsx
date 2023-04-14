import React from 'react';

import Button from 'components/button';
import Column from 'layout/statics/column';
import Wrapper from 'layout/wrapper';

import BackgroundImage from 'images/community/info-bg.jpg';

export interface CommunityInfoProps {}

export const CommunityInfo: React.FC<CommunityInfoProps> = () => {
  return (
    <>
      <div style={{ backgroundImage: `url(${BackgroundImage})` }} className="bg-cover bg-center">
        <Wrapper>
          <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-x-36 py-16">
            <Column
              title="Explore the projects shared by the community"
              subtitle="Ready to make a difference? As a user of this platform, you can easily share your projects with others."
              description="Publish your projects, promote your plans, engage with others and help build the global evidence base for Marxan applications."
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
        </Wrapper>
      </div>
      <div className="bg-white text-black">
        <Wrapper>
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-x-36 py-16 ">
            <div className="flex w-96 flex-col">
              <h4 className="mb-2">Reach out with comments or suggestions.</h4>
              <a
                className="text-left text-blue-500 hover:underline"
                href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                Contact us
              </a>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-x-36 border-t border-black border-opacity-20 py-16">
            <div className="flex w-96 flex-col">
              <h4 className="mb-2">Follow us on twitter and join in the conversation.</h4>
              <a
                className="text-left text-blue-500 hover:underline"
                href="https://twitter.com/marxan_planning?"
                rel="noopener noreferrer"
                target="_blank"
              >
                @Marxan_Planning
              </a>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-x-36 border-t border-black border-opacity-20 py-16">
            <div className="flex w-96 flex-col items-center">
              <h4>Sign up for our newsletter to receive highlights and updates.</h4>
              <div className="mt-10 w-36">
                <Button theme="primary" size="s" type="submit" className="w-full">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </Wrapper>
      </div>
    </>
  );
};

export default CommunityInfo;
