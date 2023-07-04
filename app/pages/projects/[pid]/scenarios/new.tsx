import React from 'react';

import { withProtection, withUser } from 'hoc/auth';
import { withProject } from 'hoc/projects';

import Header from 'layout/header';
import DocumentationLink from 'layout/help/documentation';
import MetaIcons from 'layout/meta-icons';
import ProjectLayout from 'layout/project';
import Protected from 'layout/protected';
import ScenarioNewMap from 'layout/scenarios/new/map';
import SidebarName from 'layout/scenarios/new/name';
import ScenariosSidebar from 'layout/scenarios/sidebar';
import Title from 'layout/title/scenario-title';
import Wrapper from 'layout/wrapper';

export const getServerSideProps = withProtection(withUser(withProject()));

const NewScenarioPage: React.FC = () => {
  return (
    <Protected>
      <Title title="New" />

      <MetaIcons />

      <ProjectLayout>
        <main className="flex h-screen w-screen flex-col">
          <Header size="base" />

          <div className="overflow-hidden py-2.5 md:flex-grow">
            <Wrapper>
              <div className="grid h-full grid-cols-1 gap-10 md:grid-cols-2">
                <ScenariosSidebar>
                  <SidebarName />
                </ScenariosSidebar>
                <ScenarioNewMap />
              </div>
            </Wrapper>
          </div>

          <DocumentationLink />
        </main>
      </ProjectLayout>
    </Protected>
  );
};

export default NewScenarioPage;
