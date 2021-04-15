import React from 'react';
import Head from 'next/head';

import Title from 'layout/title/scenario-title';
import Header from 'layout/header';
import Protected from 'layout/protected';
import Wrapper from 'layout/wrapper';

import ScenariosMap from 'layout/scenarios/map';

import ScenariosSidebar from 'layout/scenarios/sidebar';
import SidebarWDPA from 'layout/scenarios/sidebar/wdpa';
import SidebarFeatures from 'layout/scenarios/sidebar/features';

import { withProtection, withUser } from 'hoc/auth';

export const getServerSideProps = withProtection(withUser());

const EditScenarioPage: React.FC = () => {
  return (
    <Protected>
      <Title title="Edit" />

      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="flex flex-col h-full pt-2.5 pb-10 overflow-hidden md:flex-grow">
          <Wrapper>
            <div className="grid h-full grid-cols-1 gap-10 md:grid-cols-2">
              <ScenariosSidebar>
                <SidebarWDPA />
                <SidebarFeatures />
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
