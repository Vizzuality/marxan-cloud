import React from 'react';

import Head from 'next/head';
import { useRouter } from 'next/router';

import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';

export interface TitleProps {
  title?: string;
}

export const Title: React.FC<TitleProps> = ({ title }:TitleProps) => {
  const { query } = useRouter();
  const { pid, sid } = query;
  const { data: projectData } = useProject(pid);
  const { data: scenarioData } = useScenario(sid);

  return (
    <Head>
      <title>
        {/* Scenario */}
        Scenarios
        {(scenarioData?.name || title) && ':'}
        {' '}
        {title}
        {' '}
        {scenarioData?.name}
        {' '}
        {/* Project */}
        {(projectData?.name) && '-'}
        {' '}
        {projectData?.name}
      </title>
    </Head>
  );
};

export default Title;
