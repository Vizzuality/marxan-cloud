import React from 'react';

import Head from 'next/head';

import { useRouter } from 'next/router';
import { useProject } from 'hooks/projects';

export interface TitleProps {
  title?: string;
}

export const Title: React.FC<TitleProps> = ({ title }:TitleProps) => {
  const { query } = useRouter();
  const { pid } = query;
  const { data: projectData } = useProject(pid);

  return (
    <Head>
      <title>
        Projects
        {(projectData?.name || title) && ':'}
        {' '}
        {title}
        {' '}
        {projectData?.name}
      </title>
    </Head>
  );
};

export default Title;
