import React from 'react';

import Head from 'next/head';

export interface HeadComponentProps {
  title: string,
}

export const HeadComponent: React.FC<HeadComponentProps> = ({ title }:HeadComponentProps) => {
  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
};

export default HeadComponent;
