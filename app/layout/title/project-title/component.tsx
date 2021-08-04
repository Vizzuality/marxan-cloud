import React from 'react';

import Head from 'next/head';
import { useRouter } from 'next/router';

import { useProject } from 'hooks/projects';

export interface ProjectTitleProps {
  title?: string;
}

export const ProjectTitle: React.FC<ProjectTitleProps> = ({ title }:ProjectTitleProps) => {
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
      <script defer data-domain="marxan.vercel.app" src="https://plausible.io/js/plausible.js" />
    </Head>
  );
};

export default ProjectTitle;
