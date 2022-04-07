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
              <Link href="/community">
                <a href="/community" className="text-black opacity-50 hover:underline hover:opacity-100">Community</a>
              </Link>
              <Link href="/about">
                <a href="/about" className="text-black opacity-50 hover:underline hover:opacity-100">About</a>
              </Link>
            </div>
          </div>
        </Wrapper>
      </div>

      <div className="py-24 bg-gray-700">
        <Wrapper>
          <div className="justify-between w-full max-w-5xl pb-16 mx-auto space-y-24 md:flex md:space-y-0 md:space-x-36">
            <div className="space-y-12">
              <h3 className="text-2xl font-heading">
                Reach out with comments
                or suggestions.
              </h3>
              <Button
                href="mailto:marxancloud@gmail.com"
                size="lg"
                target="_blank"
                theme="secondary-alt"
                type="submit"
                className="w-full md:w-64"
              >
                Contact Us
              </Button>
            </div>

            <div className="space-y-12">
              <h3 className="text-2xl font-heading">
                Join the Google Marxan group discussion forum.
              </h3>
              <Button
                href="https://groups.google.com/g/marxan"
                className="w-full md:w-64"
                theme="secondary-alt"
                size="lg"
              >
                MARXAN Google Group
              </Button>
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
