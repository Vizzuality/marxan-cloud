import React from 'react';

import { useRouter } from 'next/router';

import { withProtection, withUser } from 'hoc/auth';

import { format } from 'date-fns';

import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenarioPU, useScenario } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

import Head from 'layout/head';
import MetaIcons from 'layout/meta-icons';
import ScenarioReportsMap from 'layout/scenarios/reports/map';

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

  const contributors = projectUsers?.map((u) => u.user.displayName);

  const projectOwner = projectUsers?.find((u) => u.roleName === 'project_owner').user.displayName;

  const {
    data: PUData,
    isFetched: PUDataIsFetched,
  } = useScenarioPU(sid);

  const {
    data: protectedAreasData,
    isFetched: protectedAreasAreFetched,
  } = useWDPACategories({
    adminAreaId: projectData?.adminAreaLevel2Id
      || projectData?.adminAreaLevel1I
      || projectData?.countryId,
    customAreaId: !projectData?.adminAreaLevel2Id
      && !projectData?.adminAreaLevel1I
      && !projectData?.countryId ? projectData?.planningAreaId : null,
    scenarioId: sid,
  });

  const protectedAreas = protectedAreasData?.filter((a) => a.selected).map((a) => a.name);

  const reportDataIsFetched = projectDataIsFetched
    && scenarioDataIsFetched && projectUsersAreFetched && PUDataIsFetched
    && protectedAreasAreFetched;

  return (
    <>

      <Head title="Solutions Report" />

      <MetaIcons />

      <main
        style={{
          minHeight: '210mm', margin: '10mm auto', padding: '33px 51px', width: '297mm',
        }}
        className="flex flex-col h-full text-black bg-white"
      >
        {reportDataIsFetched && (
          <>
            <header className="w-full mb-12">
              <div className="flex justify-between">
                <div className="flex space-x-1 text-xs">
                  <p className="font-semibold uppercase">
                    Created by:
                  </p>
                  <p className="capitalize">{projectOwner}</p>
                </div>

                <p className="text-xs font-semibold ">
                  Page 1/4
                </p>
              </div>

              <h1 className="pb-6 text-2xl text-gray-500 font-heading">
                {`${projectData.name}-${scenarioData.name}`}
              </h1>

              <div className="flex space-x-12 text-xxs">
                <div className="flex space-x-1">
                  <p className="font-semibold">Marxan platform version:</p>
                  <p> V.0.0.1</p>
                </div>
                <div className="flex space-x-1">
                  <p className="font-semibold">Date:</p>
                  <p>{format(new Date().getTime(), 'MM/dd/yyyy')}</p>
                </div>
              </div>
            </header>

            <div className="flex pt-2">

              <section className="w-1/3 space-y-8 text-xs">
                <div>
                  <p className="font-semibold">Contributors</p>
                  <p>{contributors.join(', ')}</p>
                </div>

                <div>
                  <p className="font-semibold"> Features meeting targets:</p>
                </div>

                <div>
                  <p className="font-semibold">Cost surface:</p>
                </div>

                <div>
                  <p className="font-semibold">BLM</p>
                  <p>{scenarioData.metadata.marxanInputParameterFile.BLM || null}</p>
                </div>

                <div>
                  <p className="font-semibold">Protected Areas:</p>
                  <p>{protectedAreas.join(', ')}</p>
                </div>

                <div>
                  <p className="font-semibold">No. of planning units</p>
                  <p>{`In: ${PUData.included.length || 0}`}</p>
                  <p>{`Out: ${PUData.excluded.length || 0}`}</p>
                </div>
              </section>

              <section className="w-2/3" style={{ height: '552px' }}>
                <ScenarioReportsMap />
              </section>
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default SolutionsReport;
