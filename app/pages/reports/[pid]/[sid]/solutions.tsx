import React from 'react';

import { useRouter } from 'next/router';

import { withProtection, withUser } from 'hoc/auth';

import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenarioPU, useScenario } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

import Head from 'layout/head';
import MetaIcons from 'layout/meta-icons';
import ReportHeader from 'layout/scenarios/reports/header';
import ScenarioReportsMap from 'layout/scenarios/reports/map';

export const getServerSideProps = withProtection(withUser());

const styles = {
  page: {
    minHeight: '210mm',
    margin: '10mm auto',
    padding: '33px 51px',
    width: '297mm',
  },
};

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

      <div
        style={styles.page}
        className="flex flex-col h-full text-black bg-white"
      >
        <ReportHeader page={1} totalPages={4} />

        {reportDataIsFetched && (
          <div className="flex">

            <section className="w-1/3 pt-6 space-y-8 text-xs">
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
        )}

      </div>
      <div
        style={styles.page}
        className="flex flex-col h-full text-black bg-white"
      >
        <ReportHeader page={2} totalPages={4} />

        {reportDataIsFetched && (
          <div className="flex">

            <section className="w-1/3 pt-6 space-y-8 text-xs">
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
        )}

      </div>
    </>
  );
};

export default SolutionsReport;
