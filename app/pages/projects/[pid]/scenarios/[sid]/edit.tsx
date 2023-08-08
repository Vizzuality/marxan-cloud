import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { withProtection, withUser } from 'hoc/auth';
import { withProject } from 'hoc/projects';
import { withScenario, withScenarioLock, withSolutions } from 'hoc/scenarios';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { useSaveScenario, useScenario } from 'hooks/scenarios';

import MetaIcons from 'layout/meta-icons';
import ProjectLayout from 'layout/project';
import Sidebar from 'layout/project/sidebar';
import Protected from 'layout/protected';
import ScenariosSidebarSetupFeaturesAdd from 'layout/scenarios/edit/features/set-up/add';
import ScenariosSidebarSetupFeaturesTarget from 'layout/scenarios/edit/features/set-up/targets';
import ScenarioLock from 'layout/scenarios/edit/lock';
import ScenarioEditMap from 'layout/scenarios/edit/map';
import AdvancedSettings from 'layout/scenarios/edit/parameters/advanced-settings';
import BLMCalibration from 'layout/scenarios/edit/parameters/blm-calibration';
import AdjustPanningUnits from 'layout/scenarios/edit/planning-unit/adjust-planning-units';
import ScenariosCostSurface from 'layout/scenarios/edit/planning-unit/cost-surface';
import ScenariosSidebarWDPACategories from 'layout/scenarios/edit/planning-unit/protected-areas/categories';
import ScenariosSidebarWDPAThreshold from 'layout/scenarios/edit/planning-unit/protected-areas/threshold';
import PostGapAnalysis from 'layout/scenarios/edit/solutions/gap-analysis';
import SolutionsDetails from 'layout/scenarios/edit/solutions/overview';
import ScenarioStatus from 'layout/scenarios/edit/status';
import NewScenario from 'layout/scenarios/new/name';
import ScenariosEditSidebar from 'layout/scenarios/sidebar';
import Title from 'layout/title/scenario-title';

export const getServerSideProps = withProtection(
  withUser(withProject(withScenario(withScenarioLock(withSolutions()))))
);

const EditScenarioPage = (): JSX.Element => {
  const { query } = useRouter();
  const { sid, tab } = query as { sid: string; tab: string };
  const scenarioQuery = useScenario(sid);
  const { metadata } = scenarioQuery.data || {};
  const { scenarioEditingMetadata } = metadata || {};

  const { tab: metaTab, subtab: metaSubtab, lastJobCheck } = scenarioEditingMetadata || {};

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setTab, setSubTab } = scenarioSlice.actions;
  const dispatch = useDispatch();

  const { mutate } = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  useEffect(() => {
    if (metaTab) dispatch(setTab(metaTab));
    if (metaSubtab) dispatch(setSubTab(metaSubtab));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaTab, metaSubtab]);

  // If fo some reason we dont't have lastJobCheck set in the metadata, let's add one
  useEffect(() => {
    if (!lastJobCheck && !scenarioQuery.isSuccess) {
      mutate({
        id: `${sid}`,
        data: {
          metadata: {
            ...metadata,
            scenarioEditingMetadata: {
              lastJobCheck: new Date().getTime(),
              ...scenarioEditingMetadata,
            },
          },
        },
      });
    }
  }, [lastJobCheck, metadata, mutate, scenarioEditingMetadata, scenarioQuery.isSuccess, sid]);

  return (
    <Protected>
      <Title title="Edit" />
      <MetaIcons />
      <ProjectLayout className="z-10">
        <Sidebar>
          <ScenariosEditSidebar>
            {!tab && <NewScenario />}

            {tab === 'protected-areas' && <ScenariosSidebarWDPACategories />}
            {tab === 'protected-areas-threshold' && <ScenariosSidebarWDPAThreshold />}
            {tab === 'cost-surface' && <ScenariosCostSurface />}
            {tab === 'planning-unit-status' && <AdjustPanningUnits />}
            {tab === 'features-add' && <ScenariosSidebarSetupFeaturesAdd />}
            {tab === 'features-target' && <ScenariosSidebarSetupFeaturesTarget />}

            {tab === 'advanced-settings' && <AdvancedSettings />}
            {tab === 'blm-calibration' && <BLMCalibration />}

            {tab === 'solutions' && <SolutionsDetails />}
            {tab === 'target-achievement' && <PostGapAnalysis />}
          </ScenariosEditSidebar>
        </Sidebar>
        <ScenarioEditMap />
        <ScenarioStatus />
        <ScenarioLock />
      </ProjectLayout>
    </Protected>
  );
};

export default EditScenarioPage;
