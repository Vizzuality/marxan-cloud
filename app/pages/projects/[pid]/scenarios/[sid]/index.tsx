import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';
import Title from 'layout/title/scenario-title';

export const getServerSideProps = withProtection(withUser());

const ShowScenarioPage: React.FC = () => {
  return (
    <Protected>
      <Title />

      <MetaIcons />

      <main>
        <Header size="base" />

      </main>
    </Protected>
  );
};

export default ShowScenarioPage;
