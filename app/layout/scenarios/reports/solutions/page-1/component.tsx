import React, { useMemo } from 'react';

import { useRouter } from 'next/router';

import { LEGEND_LAYERS } from 'hooks/map/constants';
import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenarioPU } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

import ScenarioReportsMap from 'layout/scenarios/reports/solutions/page-1/map';

import LegendItem from 'components/map/legend/item/component';
import LegendTypeGradient from 'components/map/legend/types/gradient';

export interface ScenariosReportPage1Props {

}

export const ScenariosReportPage1: React.FC<ScenariosReportPage1Props> = () => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const {
    data: projectData,
    isFetched: projectDataIsFetched,
  } = useProject(pid);

  const {
    data: projectUsers,
    isFetched: projectUsersDataIsFetched,
  } = useProjectUsers(pid);

  const contributors = projectUsers?.map((u) => u.user.displayName || u.user.email);

  const {
    data: protectedAreasData,
    isFetched: protectedAreasDataIsFetched,
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

  const {
    data: PUData,
    isFetched: PUDataIsFetched,
  } = useScenarioPU(sid);

  const LEGEND = useMemo(() => {
    return {
      id: 'frequency',
      name: 'Solution frequency',
      items: LEGEND_LAYERS.frequency().items,
    };
  }, []);

  const reportDataIsFetched = projectDataIsFetched && projectUsersDataIsFetched
    && protectedAreasDataIsFetched && PUDataIsFetched;

  return (
    reportDataIsFetched && (
      <div className="flex space-x-4">

        <section className="flex flex-col justify-between w-1/3">
          <div className="space-y-8 text-xs">
            <div>
              <p className="font-semibold">Contributors</p>
              <p>{contributors.join(', ')}</p>
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
          </div>

          {/* <div>
            <p className="font-semibold"> Features meeting targets:</p>
          </div>

          <div>
            <p className="font-semibold">Cost surface:</p>
          </div> */}

          {/* <div>
            <p className="font-semibold">BLM</p>
            <p>{scenarioData.metadata.marxanInputParameterFile.BLM || null}</p>
          </div> */}
          <div className="py-5 border-t border-gray-500 mr-14">
            <LegendItem
              {...LEGEND}
              key="frequency"
              className="block"
              theme="light"
            >
              <LegendTypeGradient
                items={LEGEND.items}
              />
            </LegendItem>
          </div>

        </section>

        <ScenarioReportsMap id="report-map-1" />

      </div>
    )
  );
};

export default ScenariosReportPage1;
