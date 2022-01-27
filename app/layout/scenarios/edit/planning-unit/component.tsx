import React, { useCallback, useState, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { AnimatePresence, motion } from 'framer-motion';

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
    id: 'protected-areas',
    name: 'Protected Areas',
    description: 'A gap analysis shows the percentage of each feature that is currently inside the selected conservation network (the conservation areas that were added in Protected Areas) and will inform you of the amount of conservation action still needed to achieve your targets.',
  },
  {
    id: 'adjust-planning-units',
    name: 'Adjust planning units (optional)',
    description: 'The status of a planning unit determines whether it is included in every solution (i.e. locked in) or excluded (i.e. locked out). The default status is neither included or excluded but determined during the Marxan analysis.',
  },
  {
    id: 'cost-surface',
    name: 'Cost surface',
    description: 'Costs reflect any variety of socioeconomic factors, which if minimized, might help the conservation plan be implemented more effectively and reduce conflicts with other uses.',
  },
];
export interface ScenariosSidebarEditPlanningUnitProps {

}

export const ScenariosSidebarEditPlanningUnit: React.FC<ScenariosSidebarEditPlanningUnitProps> = (

) => {
  const [section, setSection] = useState(null);
  const { query } = useRouter();
  const { pid, sid } = query;

  const { data: projectRole } = useProjectRole(pid);
  const VIEWER = projectRole === 'project_viewer';

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSubTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);
  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);

  // EFFECTS
  useEffect(() => {
    return () => {
      if (tab !== 'planning-unit') {
        setSection(null);
      }
    };
  }, [tab]);

  // CALLBACKS
  const onChangeSection = useCallback((s) => {
    setSection(s);
    const subtab = s ? `planning-unit-${s}` : 'planning-unit-preview';
    dispatch(setSubTab(subtab));
  }, [dispatch, setSubTab]);

  if (!scenarioData || tab !== 'planning-unit') return null;

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

            {!section && (
            <Sections
              key="sections"
              sections={SECTIONS}
              onChangeSection={onChangeSection}
            />
            )}

            {section === 'protected-areas' && (
            <ProtectedAreas
              key="protected-areas"
              onChangeSection={onChangeSection}
            />
            )}

            {section === 'cost-surface' && (
            <CostSurface
              key="cost-surface"
              onChangeSection={onChangeSection}
            />
            )}

            {section === 'adjust-planning-units' && (
            <AdjustPanningUnits
              key="adjust-planning-units"
              onChangeSection={onChangeSection}
            />
            )}
          </Pill>

          {!section && (
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
