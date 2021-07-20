import React from 'react';

import Title from 'layout/title/scenario-title';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';

import { withProtection, withUser } from 'hoc/auth';

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
