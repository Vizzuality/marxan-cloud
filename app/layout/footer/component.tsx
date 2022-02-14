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
    <div className="py-24 bg-gray-700">
      <Wrapper>
        <div className="flex justify-between w-full max-w-5xl pb-16 mx-auto space-x-36">
          <div className="space-y-12">
            <h2 className="text-2xl font-heading">
              Reach out with comments
              or suggestions.
            </h2>

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
            <h2 className="text-2xl font-heading">
              Join the Google Marxan group discussion forum.
            </h2>
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
        <div className="w-full h-px opacity-20" style={{ background: 'linear-gradient(to right, transparent, #ffffff, transparent)' }} />

        <div className="flex justify-between w-full max-w-5xl pt-12 mx-auto">
          <div>
            <p className="text-base">Follow us on twitter and join in the conversation.</p>
            <div className="flex items-center">
              <Icon icon={TWITTER_FILLED_SVG} className="w-5 h-5 mr-2.5 text-primary-500" />
              <a
                className="text-primary-500 hover:underline"
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
          <div className="flex items-center justify-center space-x-8 md:justify-start">
            <Link href="/terms-of-use">
              <a href="/terms-of-use" className="text-white hover:underline">Terms of use</a>
            </Link>
            <Link href="/privacy-policy">
              <a href="/privacy-policy" className="text-white hover:underline">Privacy policy</a>
            </Link>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default Footer;
