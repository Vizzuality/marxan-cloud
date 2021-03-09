import React from 'react';
import Head from 'next/head';

import Protected from 'layout/protected';
import Header from 'layout/header';
import Wrapper from 'layout/wrapper';

import ScenariosSidebar from 'layout/scenarios/sidebar';
import ScenariosMap from 'layout/scenarios/map';

import { useProject } from 'hooks/projects';
import { useRouter } from 'next/router';

const NewScenarioPage: React.FC = () => {
  const { query } = useRouter();
  const { pid } = query;
  const { data: projectData } = useProject(pid);

  return (
    <Protected>
      <Head>
        <title>
          {projectData?.name}
          {' '}
          - New Scenario
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="pt-2.5 pb-10 md:flex-grow">
          <Wrapper>
            <div className="grid h-full grid-cols-1 gap-10 md:grid-cols-2">
              <ScenariosSidebar />
              <ScenariosMap />
            </div>
          </Wrapper>
        </div>
      </main>
    </Protected>
  );
};

export default NewScenarioPage;
