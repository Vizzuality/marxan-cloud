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
import { TABS } from 'layout/project/navigation/constants';
import Sidebar from 'layout/project/sidebar';
import AdjustPanningUnits from 'layout/project/sidebar/scenario/grid-setup/planning-unit-status';
import Protected from 'layout/protected';
import ScenarioGAPAnalysis from 'layout/scenarios/edit/features/gap-analysis';
import ScenariosSidebarSetupFeaturesAdd from 'layout/scenarios/edit/features/set-up/add';
import ScenarioLock from 'layout/scenarios/edit/lock';
import ScenarioEditMap from 'layout/scenarios/edit/map';
import AdvancedSettings from 'layout/scenarios/edit/parameters/advanced-settings';
import BLMCalibration from 'layout/scenarios/edit/parameters/blm-calibration';
import ScenariosCostSurface from 'layout/scenarios/edit/planning-unit/cost-surface';
import ScenariosSidebarWDPACategories from 'layout/scenarios/edit/planning-unit/protected-areas/categories';
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

            {tab === TABS['scenario-protected-areas'] && <ScenariosSidebarWDPACategories />}
            {tab === TABS['scenario-cost-surface'] && <ScenariosCostSurface />}
            {tab === TABS['scenario-planning-unit-status'] && <AdjustPanningUnits />}
            {tab === TABS['scenario-features'] && <ScenariosSidebarSetupFeaturesAdd />}
            {tab === TABS['scenario-gap-analysis'] && (
              <ScenarioGAPAnalysis onChangeSection={() => {}} />
            )}

            {tab === TABS['scenario-advanced-settings'] && <AdvancedSettings />}
            {tab === TABS['scenario-blm-calibration'] && <BLMCalibration />}

            {tab === TABS['scenario-solutions'] && <SolutionsDetails />}
            {tab === TABS['scenario-target-achievement'] && <PostGapAnalysis />}
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
