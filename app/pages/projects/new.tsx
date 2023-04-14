import React from 'react';

import { useRouter } from 'next/router';

import { withProtection, withUser } from 'hoc/auth';

import Breadcrumb from 'components/breadcrumb';
import Header from 'layout/header';
import Help from 'layout/help/button';
import DocumentationLink from 'layout/help/documentation';
import MetaIcons from 'layout/meta-icons';
import ProjectNewForm from 'layout/projects/new/form';
import Protected from 'layout/protected';
import ProjectTitle from 'layout/title/project-title';
import Wrapper from 'layout/wrapper';

export const getServerSideProps = withProtection(withUser());

const NewProjectsPage: React.FC = () => {
  const { push } = useRouter();

  return (
    <Protected>
      <ProjectTitle title="New" />

      <MetaIcons />

      <main className="flex h-screen w-screen flex-col">
        <Header size="base" />
        <DocumentationLink />
        <Help />

        <div className="flex flex-grow flex-col overflow-hidden py-2.5">
          <Wrapper>
            <Breadcrumb
              onClick={() => {
                push('/projects');
              }}
            >
              All projects
            </Breadcrumb>

            <div className="flex flex-grow flex-col overflow-hidden pt-5">
              <ProjectNewForm />
            </div>
          </Wrapper>
        </div>
      </main>
    </Protected>
  );
};

export default NewProjectsPage;
