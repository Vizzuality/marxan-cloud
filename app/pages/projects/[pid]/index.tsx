import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import Wrapper from 'layout/wrapper';
import Protected from 'layout/protected';

import ProjectHeader from 'layout/projects/show/header';
import ProjectScenarios from 'layout/projects/show/scenarios';
import ProjectMap from 'layout/projects/show/map';

import { withProtection, withUser } from 'hoc/auth';

export const getServerSideProps = withProtection(withUser());

const ShowProjectsPage: React.FC = () => {
  return (
    <Protected>
      <Head>
        <title>Projects [id]</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="pt-2.5">
          <ProjectHeader />
        </div>

        <div className="py-5 md:flex-grow">
          <Wrapper>
            <div className="grid h-full grid-cols-1 gap-10 md:grid-cols-2">
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
