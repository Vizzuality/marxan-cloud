import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Header from 'layout/header';
import Help from 'layout/help/button';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';
import ProjectTitle from 'layout/title/project-title';

export const getServerSideProps = withProtection(withUser());

const EditProjectsPage: React.FC = () => {
  return (
    <Protected>
      <ProjectTitle title="Edit" />

      <MetaIcons />

      <Help />

      <main>
        <Header size="base" />
      </main>
    </Protected>
  );
};

export default EditProjectsPage;
