import React from 'react';

import Wrapper from 'layout/wrapper';

import Link from 'next/link';

export interface FooterProps {

}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <div className="bg-gray-700">
      <Wrapper>
        <div className="w-full max-w-5xl py-32 mx-auto">
          <h2
            className="max-w-3xl pb-10 text-6xl leading-snug font-heading"
          >
            Want to know more about Marxan?
          </h2>

          <div className="flex items-center mt-10 space-x-8 text-2xl font-heading">
            <span>Explore more:</span>
            <Link href="/about">
              <a href="/about" className="text-gray-400 hover:text-gray-200">About</a>
            </Link>
            <Link href="/community">
              <a href="/community" className="text-gray-400 hover:text-gray-200">Community</a>
            </Link>
            <Link href="/partners">
              <a href="/partners" className="text-gray-400 hover:text-gray-200">Partners</a>
            </Link>
          </div>
        </div>
      </Wrapper>

      <Wrapper>
        <div className="py-8 border-t-2 border-gray-600 border-opacity-25">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex items-center space-x-8">
              <Link href="/terms-of-use">
                <a href="/terms-of-use" className="text-white hover:underline">Terms of use</a>
              </Link>
              <Link href="/privacy-policy">
                <a href="/privacy-policy" className="text-white hover:underline">Privacy policy</a>
              </Link>
            </div>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default Footer;
