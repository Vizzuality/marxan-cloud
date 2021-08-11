import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';
import SidebarAnalysis from 'layout/scenarios/show/analysis';
import SidebarFeatures from 'layout/scenarios/show/features';
import ScenariosMap from 'layout/scenarios/show/map';
import ScenariosSidebar from 'layout/scenarios/show/sidebar';
import { ScenarioSidebarTabs } from 'layout/scenarios/show/sidebar/types';
import SidebarSolutions from 'layout/scenarios/show/solutions';
import SidebarWDPA from 'layout/scenarios/show/wdpa';
import Title from 'layout/title/scenario-title';
import Wrapper from 'layout/wrapper';

export const getServerSideProps = withProtection(withUser());

const ShowScenarioPage: React.FC = () => {
  return (
    <Protected>
      <Title title="Detail" />

      <MetaIcons />

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="flex flex-col py-2.5 overflow-hidden flex-grow">
          <Wrapper>
            <div className="grid h-full grid-cols-1 gap-10 md:grid-cols-2">
              <ScenariosSidebar>
                <SidebarWDPA key={ScenarioSidebarTabs.PROTECTED_AREAS} readOnly />
                <SidebarFeatures key={ScenarioSidebarTabs.FEATURES} readOnly />
                <SidebarAnalysis key={ScenarioSidebarTabs.ANALYSIS} readOnly />
                <SidebarSolutions key={ScenarioSidebarTabs.SOLUTIONS} readOnly />
              </ScenariosSidebar>
              <ScenariosMap />
            </div>
          </Wrapper>
        </div>
      </main>
    </Protected>
  );
};

export default ShowScenarioPage;
