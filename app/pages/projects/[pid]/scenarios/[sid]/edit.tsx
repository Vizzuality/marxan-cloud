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
import AdvancedSettingsBLMCalibration from 'layout/project/sidebar/scenario/advanced-settings/blm-calibration';
import AdvancedSettingsOverview from 'layout/project/sidebar/scenario/advanced-settings/overview';
import GridSetupCostSurface from 'layout/project/sidebar/scenario/grid-setup/cost-surface';
import GridSetupFeatures from 'layout/project/sidebar/scenario/grid-setup/features';
import GridSetupGAPAnalysis from 'layout/project/sidebar/scenario/grid-setup/gap-analysis';
import GridSetupPlanningUnits from 'layout/project/sidebar/scenario/grid-setup/planning-unit-status';
import GridSetupProtectedAreas from 'layout/project/sidebar/scenario/grid-setup/protected-areas';
import SolutionsTargetAchievements from 'layout/project/sidebar/scenario/solutions/gap-analysis';
import SolutionsOverview from 'layout/project/sidebar/scenario/solutions/overview';
import Protected from 'layout/protected';
import ScenarioLock from 'layout/scenarios/edit/lock';
import ScenarioEditMap from 'layout/scenarios/edit/map';
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

            {/* // ? grid setup */}
            {tab === TABS['scenario-protected-areas'] && <GridSetupProtectedAreas />}
            {tab === TABS['scenario-cost-surface'] && <GridSetupCostSurface />}
            {tab === TABS['scenario-planning-unit-status'] && <GridSetupPlanningUnits />}
            {tab === TABS['scenario-features'] && <GridSetupFeatures />}
            {tab === TABS['scenario-gap-analysis'] && <GridSetupGAPAnalysis />}

            {/* // ? advanced settings */}
            {tab === TABS['scenario-advanced-settings'] && <AdvancedSettingsOverview />}
            {tab === TABS['scenario-blm-calibration'] && <AdvancedSettingsBLMCalibration />}

            {/* // ? solutions */}
            {tab === TABS['scenario-solutions'] && <SolutionsOverview />}
            {tab === TABS['scenario-target-achievement'] && <SolutionsTargetAchievements />}
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
