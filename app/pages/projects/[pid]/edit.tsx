import React from 'react';

import ProjectTitle from 'layout/title/project-title';
import Header from 'layout/header';
import Protected from 'layout/protected';

import { withProtection, withUser } from 'hoc/auth';

export const getServerSideProps = withProtection(withUser());

const EditProjectsPage: React.FC = () => {
  return (
    <Protected>
      <ProjectTitle title="Edit" />

      <main>
        <Header size="base" />
      </main>
    </Protected>
  );
};

export default EditProjectsPage;
