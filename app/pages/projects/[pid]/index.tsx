import React from 'react';

import { withProtection, withUser } from 'hoc/auth';
import { withProject } from 'hoc/projects';

import Header from 'layout/header';
import DocumentationLink from 'layout/help/documentation';
import MetaIcons from 'layout/meta-icons';
import ProjectLayout from 'layout/project';
import ProjectHeader from 'layout/projects/show/header';
import ProjectMap from 'layout/projects/show/map';
import ProjectScenarios from 'layout/projects/show/scenarios';
import ProjectStatus from 'layout/projects/show/status';
import Protected from 'layout/protected';
import ProjectTitle from 'layout/title/project-title';
import Wrapper from 'layout/wrapper';

export const getServerSideProps = withProtection(withUser(withProject()));

const ShowProjectsPage: React.FC = () => {
  return (
    <Protected>
      <ProjectTitle title="" />

      <MetaIcons />

      <ProjectLayout>
        <main className="flex h-screen w-screen flex-col">
          <Header size="base" />

          <DocumentationLink />

          <ProjectStatus />

          <div className="pt-2.5">
            <ProjectHeader />
          </div>

          <div className="overflow-hidden py-5 md:flex-grow">
            <Wrapper>
              <div className="grid h-full grid-cols-1 gap-10 md:grid-cols-12">
                <ProjectScenarios />
                <ProjectMap />
              </div>
            </Wrapper>
          </div>
        </main>
      </ProjectLayout>
    </Protected>
  );
};

export default ShowProjectsPage;
