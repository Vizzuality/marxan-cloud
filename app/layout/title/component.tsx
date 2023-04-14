import React from 'react';

import Head from 'next/head';

export interface TitleProps {
  title: string;
  subtitle?: string;
}

export const Title: React.FC<TitleProps> = ({ title, subtitle }: TitleProps) => {
  return (
    <Head>
      <title>
        {title}

        {subtitle && ` - ${subtitle}`}
      </title>
    </Head>
  );
};

export default Title;
