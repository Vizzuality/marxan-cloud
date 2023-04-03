import React from 'react';

import Link from 'next/link';

import Wrapper from 'layout/wrapper';

import Button from 'components/button';
import Icon from 'components/icon';

import TWITTER_FILLED_SVG from 'svgs/social/twitter-filled.svg?sprite';

export interface FooterProps {

}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <>
      <div className="bg-primary-500">
        <Wrapper>
          <div className="flex flex-col w-full max-w-5xl py-24 mx-auto space-y-18 font-heading">
            <div className="text-3xl text-black md:text-6xl">
              <p>
                Want to know more
              </p>
              <p>
                about Marxan?
              </p>
            </div>
            <div className="flex flex-col space-y-6 text-2xl md:space-y-0 md:space-x-8 md:items-center md:flex-row">
              <p className="text-black">Explore more:</p>
              <Link
                href="/community/projects"
                className="text-black opacity-50 hover:underline hover:opacity-100"
              >
                Community
              </Link>
              <Link
                href="/about"
                className="text-black opacity-50 hover:underline hover:opacity-100"
              >
                About
              </Link>
            </div>
          </div>
        </Wrapper>
      </div>

      <div className="py-24 bg-gray-700">
        <Wrapper>
          <div className="grid justify-between w-full max-w-5xl grid-cols-1 pb-16 mx-auto md:grid-cols-2 gap-36">
            <div className="space-y-12">
              <h3 className="text-2xl font-heading">
                Reach out with comments
                or suggestions.
              </h3>
              <Button
                href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
                size="lg"
                target="_blank"
                theme="secondary-alt"
                type="submit"
                className="w-full md:w-64"
              >
                Contact Us
              </Button>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-heading">
                <a
                  className="underline hover:no-underline"
                  href="https://groups.google.com/g/marxan"
                  rel="noreferrer"
                  target="_blank"
                >
                  Join the Google Marxan
                </a>
                {' '}
                group discussion forum.
              </h3>
              <p>
                Marxan’s social media and google group is moderated by a vibrant
                community of practice and not by TNC or partners of the Marxan
                Planning Platform.
              </p>
            </div>
          </div>

          <div className="w-full h-px max-w-5xl mx-auto opacity-20" style={{ background: 'linear-gradient(to right, transparent, #ffffff, transparent)' }} />

          <div className="justify-between w-full max-w-5xl pt-12 mx-auto space-y-10 md:flex md:space-y-0">
            <div className="space-y-2">
              <p className="text-base">Follow us on twitter and join in the conversation.</p>
              <div className="flex items-center space-x-3">
                <Icon icon={TWITTER_FILLED_SVG} className="w-5 h-5 text-primary-500" />
                <a
                  className="font-semibold text-primary-500 hover:underline"
                  type="button"
                  role="button"
                  href="https://twitter.com/marxan_planning?"
                  rel="noreferrer"
                  target="_blank"
                >
                  @Marxan_Planning
                </a>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-center md:space-x-8">

              <a
                className="text-white hover:underline"
                href="https://www.nature.org/en-us/about-us/who-we-are/accountability/terms-of-use"
                rel="noreferrer"
                target="_blank"
              >
                Terms of use
              </a>

              <a
                className="text-white hover:underline"
                href="https://www.nature.org/en-us/about-us/who-we-are/accountability/privacy-policy"
                rel="noreferrer"
                target="_blank"
              >
                Privacy policy
              </a>

            </div>
          </div>
        </Wrapper>
      </div>
    </>
  );
};

export default Footer;
