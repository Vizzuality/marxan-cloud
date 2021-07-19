import React from 'react';

import Head from 'next/head';

import { useRouter } from 'next/router';
import { usePublishedProject } from 'hooks/projects';

export interface PublishedProjectTitleProps {
  title?: string;
}

export const PublishedProjectTitle: React.FC<PublishedProjectTitleProps> = ({
  title,
}:PublishedProjectTitleProps) => {
  const { query } = useRouter();
  const { pid } = query;
  const { data: projectData } = usePublishedProject(pid);

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

export default PublishedProjectTitle;
