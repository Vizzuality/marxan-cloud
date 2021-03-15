import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import Protected from 'layout/protected';

import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useRouter } from 'next/router';

import { withProtection, withUser } from 'hoc/auth';

export const getServerSideProps = withProtection(withUser());

const EditScenarioPage: React.FC = () => {
  const { query } = useRouter();
  const { pid, sid } = query;
  const { data: projectData } = useProject(pid);
  const { data: scenarioData } = useScenario(sid);

  return (
    <Protected>
      <Head>
        <title>
          {projectData?.name}
          {' '}
          -
          {' Edit '}
          {scenarioData?.name}
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="base" />

      </main>
    </Protected>
  );
};

export default EditScenarioPage;
