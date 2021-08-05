import React from 'react';

import Link from 'next/link';

import Wrapper from 'layout/wrapper';

export interface FooterProps {

}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <div className="bg-gray-700">
      <Wrapper>
        <div className="w-full max-w-5xl py-32 mx-auto">
          <h2
            className="text-5xl pb-7 md:text-6xl font-heading"
          >
            Want to know more
          </h2>
          <h2
            className="pb-10 text-5xl md:text-6xl font-heading"
          >
            about Marxan?
          </h2>
          <div className="flex flex-col items-center mt-16 space-y-8 text-2xl md:mt-10 md:space-y-0 md:space-x-8 font-heading md:flex-row">
            <span>Explore more:</span>
            <Link href="/about">
              <a href="/about" className="text-gray-400 hover:text-gray-200">About</a>
            </Link>
            <Link href="/community">
              <a href="/community" className="text-gray-400 hover:text-gray-200">Community</a>
            </Link>
          </div>
        </div>
      </Wrapper>

      <Wrapper>
        <div className="py-8 border-t-2 border-gray-600 border-opacity-25">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex items-center justify-center space-x-8 md:justify-start">
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
