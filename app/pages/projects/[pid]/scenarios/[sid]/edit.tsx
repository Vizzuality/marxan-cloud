import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { withProtection, withUser } from 'hoc/auth';
import { withProject } from 'hoc/projects';
import { withScenario, withScenarioLock } from 'hoc/scenarios';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import MetaIcons from 'layout/meta-icons';
import ProjectLayout from 'layout/project';
import Sidebar from 'layout/project/sidebar';
import Protected from 'layout/protected';
import SidebarEditFeatures from 'layout/scenarios/edit/features';
import ScenariosSidebarSetupFeaturesAdd from 'layout/scenarios/edit/features/set-up/add';
import ScenariosSidebarSetupFeaturesTarget from 'layout/scenarios/edit/features/set-up/targets';
import ScenarioLock from 'layout/scenarios/edit/lock';
import ScenarioEditMap from 'layout/scenarios/edit/map';
import SidebarEditAnalysis from 'layout/scenarios/edit/parameters';
import AdvancedSettings from 'layout/scenarios/edit/parameters/advanced-settings';
import BLMCalibration from 'layout/scenarios/edit/parameters/blm-calibration';
import AdjustPanningUnits from 'layout/scenarios/edit/planning-unit/adjust-planning-units';
import ScenariosCostSurface from 'layout/scenarios/edit/planning-unit/cost-surface/component';
import ScenariosSidebarWDPACategories from 'layout/scenarios/edit/planning-unit/protected-areas/categories';
import ScenariosSidebarWDPAThreshold from 'layout/scenarios/edit/planning-unit/protected-areas/threshold';
import PostGapAnalysis from 'layout/scenarios/edit/solutions/gap-analysis';
import SolutionsDetails from 'layout/scenarios/edit/solutions/overview';
import ScenarioStatus from 'layout/scenarios/edit/status';
import ScenariosEditSidebar from 'layout/scenarios/sidebar';
import Title from 'layout/title/scenario-title';
import { Tab } from 'types/navigation';
import { ScenarioSidebarTabs } from 'utils/tabs';

import { useSaveScenario, useScenario } from 'hooks/scenarios';

export const getServerSideProps = withProtection(
  withUser(withProject(withScenario(withScenarioLock())))
);

const EditScenarioPage = (): JSX.Element => {
  const { query } = useRouter();
  const { sid, tab } = query as { sid: string; tab: Tab };
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

  console.log({ tab });

  return (
    <Protected>
      <Title title="Edit" />
      <MetaIcons />
      <ProjectLayout className="z-10">
        <Sidebar>
          <ScenariosEditSidebar>
            {sid && tab === 'protected-areas-preview' && <ScenariosSidebarWDPACategories />}
            {sid && tab === 'protected-areas-threshold' && <ScenariosSidebarWDPAThreshold />}

            {sid && tab === 'cost-surface' && <ScenariosCostSurface />}

            {sid && tab === 'planning-unit-status' && <AdjustPanningUnits />}

            {sid && tab === 'features-add' && <ScenariosSidebarSetupFeaturesAdd />}
            {sid && tab === 'features-target' && <ScenariosSidebarSetupFeaturesTarget />}

            {sid && tab === 'blm-calibration' && <BLMCalibration />}

            {sid && tab === 'overview' && <AdvancedSettings />}

            {sid && tab === 'target-achievement' && <PostGapAnalysis />}
            {sid && tab === 'solutions-overview' && <SolutionsDetails />}
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
