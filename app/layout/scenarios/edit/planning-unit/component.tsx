import React, { useCallback, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { AnimatePresence, motion } from 'framer-motion';
import { ScenarioSidebarSubTabs, ScenarioSidebarTabs } from 'utils/tabs';

import { useProjectRole } from 'hooks/project-users';
import { useScenario } from 'hooks/scenarios';

import Pill from 'layout/pill';
import AdjustPanningUnits from 'layout/scenarios/edit/planning-unit/adjust-planning-units';
import CostSurface from 'layout/scenarios/edit/planning-unit/cost-surface';
import ProtectedAreas from 'layout/scenarios/edit/planning-unit/protected-areas';
import Sections from 'layout/sections';

import Button from 'components/button';

const SECTIONS = [
  {
    id: ScenarioSidebarSubTabs.PROTECTED_AREAS_PREVIEW,
    name: 'Protected Areas',
    description: 'A gap analysis shows the percentage of each feature that is currently inside the selected conservation network (the conservation areas that were added in Protected Areas) and will inform you of the amount of conservation action still needed to achieve your targets.',
  },
  {
    id: ScenarioSidebarSubTabs.PLANNING_UNIT_ADJUST_PLANNING_UNITS,
    name: 'Adjust planning units (optional)',
    description: 'The status of a planning unit determines whether it is included in every solution (i.e. locked in) or excluded (i.e. locked out). The default status is neither included or excluded but determined during the Marxan analysis.',
  },
  {
    id: ScenarioSidebarSubTabs.PLANNING_UNIT_COST_SURFACE,
    name: 'Cost surface',
    description: 'Costs reflect any variety of socioeconomic factors, which if minimized, might help the conservation plan be implemented more effectively and reduce conflicts with other uses.',
  },
];
export interface ScenariosSidebarEditPlanningUnitProps {

}

export const ScenariosSidebarEditPlanningUnit: React.FC<ScenariosSidebarEditPlanningUnitProps> = (

) => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const { data: projectRole } = useProjectRole(pid);
  const VIEWER = projectRole === 'project_viewer';

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setTab, setSubTab } = scenarioSlice.actions;

  const { tab, subtab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);
  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);

  // EFFECTS
  useEffect(() => {
    // Check that the subtab is a valid planning unit subtab
    if (!SECTIONS.find((s) => s.id === subtab)) {
      dispatch(setSubTab(null));
    }
  }, []); // eslint-disable-line

  // CALLBACKS
  const onChangeSection = useCallback((s) => {
    const sub = s || null;
    dispatch(setSubTab(sub));
  }, [dispatch, setSubTab]);

  const onContinue = useCallback(() => {
    dispatch(setTab(ScenarioSidebarTabs.FEATURES));
    dispatch(setSubTab(null));
  }, [dispatch, setTab, setSubTab]);

  if (!scenarioData || tab !== ScenarioSidebarTabs.PLANNING_UNIT) return null;

  return (
    <div className="flex flex-col flex-grow w-full h-full overflow-hidden">
      <motion.div
        key="planning-unit"
        className="flex flex-col min-h-0 overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AnimatePresence>
          <Pill selected>
            <header className="flex justify-between flex-shrink-0">
              <div>
                <div className="flex items-baseline space-x-4">
                  <h2 className="text-lg font-medium font-heading">Planning Unit</h2>
                </div>
              </div>
            </header>

            {!subtab && (
              <Sections
                key="sections"
                sections={SECTIONS}
                onChangeSection={onChangeSection}
              />
            )}

            {(subtab === ScenarioSidebarSubTabs.PROTECTED_AREAS_PREVIEW
              || subtab === ScenarioSidebarSubTabs.PROTECTED_AREAS_THRESHOLD)
              && (
                <ProtectedAreas
                  key="protected-areas"
                />
              )}

            {subtab === ScenarioSidebarSubTabs.PLANNING_UNIT_COST_SURFACE && (
              <CostSurface
                key="cost-surface"
                onChangeSection={onChangeSection}
              />
            )}

            {subtab === ScenarioSidebarSubTabs.PLANNING_UNIT_ADJUST_PLANNING_UNITS && (
              <AdjustPanningUnits
                key="adjust-planning-units"
                onChangeSection={onChangeSection}
              />
            )}
          </Pill>

          {!subtab && (
            <motion.div
              key="continue-scenario-button"
              className="flex justify-center flex-shrink-0 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Button
                theme="primary"
                size="lg"
                disabled={VIEWER}
                onClick={onContinue}
              >
                Continue
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>

  );
};

export default ScenariosSidebarEditPlanningUnit;
