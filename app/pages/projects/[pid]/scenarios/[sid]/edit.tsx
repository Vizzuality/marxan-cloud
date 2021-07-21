import React from 'react';

import Title from 'layout/title/scenario-title';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';
import Wrapper from 'layout/wrapper';

import ScenariosMap from 'layout/scenarios/map';

import ScenariosSidebar from 'layout/scenarios/sidebar';
import SidebarWDPA from 'layout/scenarios/sidebar/wdpa';
import SidebarFeatures from 'layout/scenarios/sidebar/features';
import SidebarAnalysis from 'layout/scenarios/sidebar/analysis';
import SidebarSolutions from 'layout/scenarios/sidebar/solutions';
import { ScenarioSidebarTabs } from 'layout/scenarios/sidebar/types';

import { withProtection, withUser } from 'hoc/auth';

export const getServerSideProps = withProtection(withUser());

const EditScenarioPage: React.FC = () => {
  return (
    <Protected>
      <Title title="Edit" />

      <MetaIcons />

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="flex flex-col py-2.5 overflow-hidden flex-grow">
          <Wrapper>
            <div className="grid h-full grid-cols-1 gap-10 md:grid-cols-2">
              <ScenariosSidebar>
                <SidebarWDPA key={ScenarioSidebarTabs.PROTECTED_AREAS} />
                <SidebarFeatures key={ScenarioSidebarTabs.FEATURES} />
                <SidebarAnalysis key={ScenarioSidebarTabs.ANALYSIS} />
                <SidebarSolutions key={ScenarioSidebarTabs.SOLUTIONS} />
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
