import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import Protected from 'layout/protected';

import Wrapper from 'layout/wrapper';

import ProjectMap from 'layout/projects/new/map';
import ProjectForm from 'layout/projects/new/form';
import Breadcrumb from 'components/breadcrumb';

import { withProtection, withUser } from 'hoc/auth';
import { useRouter } from 'next/router';

export const getServerSideProps = withProtection(withUser());

const NewProjectsPage: React.FC = () => {
  const { push } = useRouter();

  return (
    <Protected>
      <Head>
        <title>New Project</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="pt-2.5 pb-10 md:flex-grow">
          <Wrapper>
            <Breadcrumb
              onClick={() => {
                push('/projects');
              }}
            >
              All projects
            </Breadcrumb>

            <div className="grid h-full grid-cols-1 gap-10 mt-2 bg-gray-700 md:grid-cols-2 rounded-3xl">
              <ProjectForm />
              <ProjectMap />
            </div>
          </Wrapper>
        </div>
      </main>
    </Protected>
  );
};

export default NewProjectsPage;
