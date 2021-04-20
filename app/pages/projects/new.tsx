import React from 'react';
import Head from 'next/head';

import Title from 'layout/title/project-title';
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
      <Title title="New" />
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="py-2.5 md:flex-grow">
          <Wrapper>
            <Breadcrumb
              onClick={() => {
                push('/projects');
              }}
            >
              All projects
            </Breadcrumb>

            <div className="h-full pt-5">
              <div className="grid h-full grid-cols-1 gap-10 bg-gray-700 md:grid-cols-2 rounded-3xl">
                <ProjectForm />
                <ProjectMap />
              </div>
            </div>
          </Wrapper>
        </div>
      </main>
    </Protected>
  );
};

export default NewProjectsPage;
