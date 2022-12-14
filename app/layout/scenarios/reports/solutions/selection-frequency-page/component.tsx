import React, { useMemo } from 'react';

import { useRouter } from 'next/router';

import { LEGEND_LAYERS } from 'hooks/map/constants';
import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

import ScenarioReportsMap from 'layout/scenarios/reports/solutions/selection-frequency-page/map';

import LegendItem from 'components/map/legend/item/component';
import LegendTypeGradient from 'components/map/legend/types/gradient';

export interface SelectionFrequencyPageProps {

}

export const SelectionFrequencyPage: React.FC<SelectionFrequencyPageProps> = () => {
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

  const {
    data: scenarioData,
  } = useScenario(sid);

  const protectedAreas = useMemo(() => {
    return protectedAreasData?.sort((a, b) => {
      if (a.kind === 'project') return 1;
      if (a.name === 'Not Reported') return 1;
      if (b.name !== 'Not Reported') return -1;
      return a - b;
    }).map((pa) => {
      if (pa.kind === 'global' && pa.name !== 'Not Reported') {
        return {
          ...pa,
          name: `Category ${pa.name}`,
        };
      } return {
        ...pa,
      };
    }).filter((a) => a.selected).map((a) => a.name);
  }, [protectedAreasData]);

  const LEGEND = useMemo(() => {
    return {
      id: 'frequency',
      name: 'Selection frequency',
      items: LEGEND_LAYERS.frequency({
        options: {
          numberOfRuns: scenarioData?.numberOfRuns || 0,
        },
      }).items,
    };
  }, [scenarioData?.numberOfRuns]);

  const reportDataIsFetched = projectDataIsFetched && projectUsersDataIsFetched
    && protectedAreasDataIsFetched;

  return (
    reportDataIsFetched && (
      <div className="flex space-x-8">

        <section className="flex flex-col justify-between w-1/3">
          <div className="space-y-8 text-xs">
            <div>
              <p className="font-semibold">Contributors</p>
              <p>{contributors.join(', ')}</p>
            </div>
            <div>
              <p className="font-semibold">Protected Areas [1]:</p>
              <p>{protectedAreas.join(', ')}</p>
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
          <div>
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
            <div className="mt-5">
              <p className="text-xxs">
                [1] The IUCN Protected Area Categories is a global standard that classifies sites
                according to their conservation objectives. It is not a compulsory non-hierarchical
                standard nor is applied by IUCN globally. It is for government agencies or other
                institutions to use, which means that in some countries there might not be any
                categories assigned yet. For more information about this standard, see:
                <a
                  className="underline"
                  href="https://www.iucn.org/theme/protected-areas/about/protected-area-categories"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {' '}
                  https://www.iucn.org/theme/protected-areas/about/protected-area-categories
                </a>
              </p>
            </div>
          </div>

        </section>

        <ScenarioReportsMap id="report-map-1" />

      </div>
    )
  );
};

export default SelectionFrequencyPage;
