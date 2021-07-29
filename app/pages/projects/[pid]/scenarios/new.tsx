import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Header from 'layout/header';
import Help from 'layout/help/button';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';
import ScenariosMap from 'layout/scenarios/map';
import ScenariosSidebar from 'layout/scenarios/sidebar';
import SidebarName from 'layout/scenarios/sidebar/name';
import Title from 'layout/title/scenario-title';
import Wrapper from 'layout/wrapper';

export const getServerSideProps = withProtection(withUser());

const NewScenarioPage: React.FC = () => {
  return (
    <Protected>
      <Title title="New" />

      <MetaIcons />

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="py-2.5 overflow-hidden md:flex-grow">
          <Wrapper>
            <div className="grid h-full grid-cols-1 gap-10 md:grid-cols-2">
              <ScenariosSidebar>
                <SidebarName />
              </ScenariosSidebar>
              <ScenariosMap />
            </div>
          </Wrapper>
        </div>

        <Help />
      </main>
    </Protected>
  );
};

export default NewScenarioPage;
