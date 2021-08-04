import React from 'react';

import Head from 'next/head';

export interface HeadComponentProps {
  title: string,
}

export const HeadComponent: React.FC<HeadComponentProps> = ({ title }:HeadComponentProps) => {
  return (
    <Head>
      <title>{title}</title>
      <script defer data-domain="marxan.vercel.app" src="https://plausible.io/js/plausible.js" />
    </Head>
  );
};

export default HeadComponent;
