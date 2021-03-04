import React from 'react';
import Head from 'next/head';

import Protected from 'layout/protected';
import Header from 'layout/header';
import Wrapper from 'layout/wrapper';

import ScenariosMap from 'layout/scenarios/map';

import ScenariosSidebar from 'layout/scenarios/sidebar';
import SidebarWDPA from 'layout/scenarios/sidebar/wdpa';

import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useRouter } from 'next/router';

const EditScenarioPage: React.FC = () => {
  const { query } = useRouter();
  const { pid, sid } = query;
  const { data: projectData } = useProject(pid);
  const { data: scenarioData } = useScenario(sid);

  return (
    <Protected>
      <Head>
        <title>
          {projectData?.name}
          {' '}
          -
          {' Edit '}
          {scenarioData?.name}
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="pt-2.5 pb-10 md:flex-grow">
          <Wrapper>
            <div className="grid h-full grid-cols-1 gap-10 md:grid-cols-2">
              <ScenariosSidebar>
                <SidebarWDPA />
              </ScenariosSidebar>
              <ScenariosMap />
            </div>
          </Wrapper>
        </div>
      </main>
    </Protected>
  );
};

export default EditScenarioPage;
