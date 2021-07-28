import React from 'react';

import ProjectTitle from 'layout/title/project-title';
import Header from 'layout/header';
import Protected from 'layout/protected';
import Help from 'layout/help/button';
import MetaIcons from 'layout/meta-icons';
import Wrapper from 'layout/wrapper';

import ProjectNewForm from 'layout/projects/new/form';
import Breadcrumb from 'components/breadcrumb';

import { withProtection, withUser } from 'hoc/auth';
import { useRouter } from 'next/router';

export const getServerSideProps = withProtection(withUser());

const NewProjectsPage: React.FC = () => {
  const { push } = useRouter();

  return (
    <Protected>

      <ProjectTitle title="New" />

      <MetaIcons />

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <Help />

        <div className="flex flex-col py-2.5 overflow-hidden flex-grow">
          <Wrapper>
            <Breadcrumb
              onClick={() => {
                push('/projects');
              }}
            >
              All projects
            </Breadcrumb>

            <div className="flex flex-col flex-grow pt-5 overflow-hidden">
              <ProjectNewForm />
            </div>
          </Wrapper>
        </div>
      </main>
    </Protected>
  );
};

export default NewProjectsPage;
