import React from 'react';

import Link from 'next/link';

import Button from 'components/button';
import Icon from 'components/icon';
import Wrapper from 'layout/wrapper';

import TWITTER_FILLED_SVG from 'svgs/social/twitter-filled.svg?sprite';

export interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <>
      <div className="bg-primary-500">
        <Wrapper>
          <div className="space-y-18 mx-auto flex w-full max-w-5xl flex-col py-24 font-heading">
            <div className="text-3xl text-black md:text-6xl">
              <p>Want to know more</p>
              <p>about Marxan?</p>
            </div>
            <div className="flex flex-col space-y-6 text-2xl md:flex-row md:items-center md:space-x-8 md:space-y-0">
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

      <div className="bg-gray-800 py-24">
        <Wrapper>
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 justify-between gap-36 pb-16 md:grid-cols-2">
            <div className="space-y-12">
              <h3 className="font-heading text-2xl">Reach out with comments or suggestions.</h3>
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
              <h3 className="font-heading text-2xl">
                <a
                  className="underline hover:no-underline"
                  href="https://groups.google.com/g/marxan"
                  rel="noreferrer"
                  target="_blank"
                >
                  Join the Google Marxan
                </a>{' '}
                group discussion forum.
              </h3>
              <p>
                Marxan’s social media and google group is moderated by a vibrant community of
                practice and not by TNC or partners of the Marxan Planning Platform.
              </p>
            </div>
          </div>

          <div
            className="mx-auto h-px w-full max-w-5xl opacity-20"
            style={{ background: 'linear-gradient(to right, transparent, #ffffff, transparent)' }}
          />

          <div className="mx-auto w-full max-w-5xl justify-between space-y-10 pt-12 md:flex md:space-y-0">
            <div className="space-y-2">
              <p className="text-base">Follow us on twitter and join in the conversation.</p>
              <div className="flex items-center space-x-3">
                <Icon icon={TWITTER_FILLED_SVG} className="h-5 w-5 text-primary-500" />
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
