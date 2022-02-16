import React from 'react';

import { useRouter } from 'next/router';

import { withProtection, withUser } from 'hoc/auth';

import { format } from 'date-fns';

import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';

import Head from 'layout/head';
import MetaIcons from 'layout/meta-icons';

export const getServerSideProps = withProtection(withUser());

const SolutionsReport: React.FC = () => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const {
    data: projectData,
    isFetched: projectDataIsFetched,
  } = useProject(pid);

  const {
    data: scenarioData,
    isFetched: scenarioDataIsFetched,
  } = useScenario(sid);

  const {
    data: projectUsers,
    isFetched: projectUsersAreFetched,
  } = useProjectUsers(pid);

  const projectOwner = projectUsers?.find((u) => u.roleName === 'project_owner').user.displayName;

  return (
    <>

      <Head title="Solutions Report" />

      <MetaIcons />

      <main
        style={{
          minHeight: '210mm', margin: '10mm auto', padding: '33px 51px', width: '297mm',
        }}
        className="flex h-full bg-white"
      >
        {projectDataIsFetched && scenarioDataIsFetched && projectUsersAreFetched && (
          <header className="w-full text-black">

            <div className="flex justify-between">
              <p className="uppercase">
                Created by:
                {' '}
                <span className="capitalize">{projectOwner}</span>
              </p>
              <p>
                Page 1/4
              </p>
            </div>

            <h1 className="text-2xl text-gray-500 font-heading">
              {`${projectData.name}-${scenarioData.name}`}
            </h1>

            <div>
              <p>
                Marxan platform version:
                <span>V.0.0.1</span>
              </p>
              <p>
                Date:
                <span>
                  {' '}
                  {format(new Date().getTime(), 'MM/dd/yyyy')}
                </span>
              </p>
            </div>
          </header>
        )}
      </main>
    </>
  );
};

export default SolutionsReport;
