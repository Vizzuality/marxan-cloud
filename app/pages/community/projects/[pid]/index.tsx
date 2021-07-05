import React from 'react';
import Head from 'next/head';

import Avatar from 'components/avatar';
import Backlink from 'layout/statics/backlink';
import Button from 'components/button';
import Header from 'layout/header';
import Icon from 'components/icon';
import Title from 'layout/title/project-title';
import Wrapper from 'layout/wrapper';

import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

const PublishedProjectPage: React.FC = () => {
  return (
    <div>
      <Title title="" />
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />
        <Wrapper>
          <div className="flex flex-row w-full py-16">
            <div className="w-7/12 pr-12">
              <Backlink href="/community/projects">
                Projects
              </Backlink>
              <h2
                className="mt-3 mb-10 text-4xl font-semibold text-left font-heading"
              >
                Kenya Project
              </h2>
              <p className="mb-10 text-base leading-normal text-gray-400">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem
                ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="flex flex-row items-center mb-10">
                <Button size="s" theme="transparent-white" className="px-6 group">
                  Duplicate
                  <Icon icon={DOWNLOAD_SVG} className="w-3.5 h-3.5 ml-2 text-white group-hover:text-black" />
                </Button>
                <p className="ml-5 text-sm text-white">
                  Duplicated 120K times
                </p>
              </div>
              <div className="grid grid-cols-2 grid-rows-3 gap-y-11 gap-x-9">
                <div>
                  <h3 className="text-sm font-semibold text-white">Creators</h3>
                  <div className="flex flex-row items-center mb-5">
                    <Avatar bgImage="/images/avatar.png" size="s" />
                    <p className="ml-5 text-sm text-white">Tamara Huete</p>
                  </div>
                  <div className="flex flex-row items-center mb-5">
                    <Avatar bgImage="/images/avatar.png" size="s" />
                    <p className="ml-5 text-sm text-white">Tamara Huete</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Planning Área</h3>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Scenarios</h3>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Tags</h3>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Share</h3>
                </div>
              </div>
            </div>
            <div className="w-5/12">
              Map
            </div>
          </div>
        </Wrapper>
      </main>
    </div>
  );
};

export default PublishedProjectPage;
