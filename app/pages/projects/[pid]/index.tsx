import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Header from 'layout/header';
import Help from 'layout/help/button';
import MetaIcons from 'layout/meta-icons';
import ProjectHeader from 'layout/projects/show/header';
import ProjectMap from 'layout/projects/show/map';
import ProjectScenarios from 'layout/projects/show/scenarios';
import Protected from 'layout/protected';
import ProjectTitle from 'layout/title/project-title';
import Wrapper from 'layout/wrapper';

export const getServerSideProps = withProtection(withUser());

const ShowProjectsPage: React.FC = () => {
  return (
    <Protected>
      <ProjectTitle title="" />

      <MetaIcons />

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <Help />

        <div className="pt-2.5">
          <ProjectHeader />
        </div>

        <div className="py-5 overflow-hidden md:flex-grow">
          <Wrapper>
            <div className="grid h-full grid-cols-1 gap-10 md:grid-cols-12">
              <ProjectScenarios />
              <ProjectMap />
            </div>
          </Wrapper>
        </div>
      </main>
    </Protected>
  );
};

export default ShowProjectsPage;
