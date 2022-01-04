import React, { useCallback, useState, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { AnimatePresence, motion } from 'framer-motion';

import { useRoleMe } from 'hooks/project-users';
import { useScenario } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import AdjustPanningUnits from 'layout/scenarios/edit/analysis/adjust-planning-units';
import CostSurface from 'layout/scenarios/edit/analysis/cost-surface';
import GapAnalysis from 'layout/scenarios/edit/analysis/gap-analysis';
import Run from 'layout/scenarios/edit/run';
import Sections from 'layout/sections';

import Button from 'components/button';
import Modal from 'components/modal';

const SECTIONS = [
  {
    id: 'gap-analysis',
    name: 'Gap analysis',
    description: 'A gap analysis shows the percentage of each feature that is currently inside the selected conservation network (the conservation areas that were added in Protected Areas) and will inform you of the amount of conservation action still needed to achieve your targets.',
  },
  {
    id: 'cost-surface',
    name: 'Cost surface',
    description: 'Costs reflect any variety of socioeconomic factors, which if minimized, might help the conservation plan be implemented more effectively and reduce conflicts with other uses.',
  },
  {
    id: 'adjust-planning-units',
    name: 'Adjust planning units (optional)',
    description: 'The status of a planning unit determines whether it is included in every solution (i.e. locked in) or excluded (i.e. locked out). The default status is neither included or excluded but determined during the Marxan analysis.',
  },
];
export interface ScenariosSidebarEditAnalysisProps {

}

export const ScenariosSidebarEditAnalysis: React.FC<ScenariosSidebarEditAnalysisProps> = () => {
  const [section, setSection] = useState(null);
  const [runOpen, setRunOpen] = useState(false);
  const { query } = useRouter();
  const { pid, sid } = query;

  const { data: roleMe } = useRoleMe(pid);
  const VIEWER = roleMe === 'project_viewer';

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSubTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);
  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);

  // EFFECTS
  useEffect(() => {
    return () => {
      if (tab !== 'analysis') {
        setSection(null);
      }
    };
  }, [tab]);

  // CALLBACKS
  const onChangeSection = useCallback((s) => {
    setSection(s);
    const subtab = s ? `analysis-${s}` : 'analysis-preview';
    dispatch(setSubTab(subtab));
  }, [dispatch, setSubTab]);

  if (!scenarioData || tab !== 'analysis') return null;

  return (
    <div className="flex flex-col flex-grow w-full h-full overflow-hidden">
      <HelpBeacon
        id="scenarios-analysis"
        title="Analysis"
        subtitle="Fine tune your Marxan plan"
        content={(
          <div className="space-y-2">
            <p>
              This section helps you refine your
              plan by allowing you to:
            </p>
            <ol className="pl-6 space-y-2 list-disc">
              <li>
                Evaluate your set targets by viewing the
                current conservation status of your
                features in the
                <b> GAP ANALYSIS</b>
              </li>
              <li>
                Add a cost surface in
                <b> COST SURFACE</b>
              </li>
              <li>
                Exclude or force include
                some planning units in the analysis in
                <b>
                  {' '}
                  ADJUST
                  PLANNING UNITS
                </b>
              </li>
            </ol>
          </div>
        )}
        modifiers={['flip']}
        tooltipPlacement="left"
      >

        <motion.div
          key="analysis"
          className="flex flex-col min-h-0 overflow-hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AnimatePresence>
            <Pill selected>
              <header className="flex justify-between flex-shrink-0">
                <div>
                  <div className="flex items-baseline space-x-4">
                    <h2 className="text-lg font-medium font-heading">Analysis</h2>
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

              {section === 'gap-analysis' && (
                <GapAnalysis
                  key="gap-analysis"
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
                key="run-scenario-button"
                className="flex justify-center flex-shrink-0 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Button
                  theme="spacial"
                  size="lg"
                  disabled={VIEWER}
                  onClick={() => setRunOpen(true)}
                >
                  Run scenario
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Modal
            title="Run scenario"
            open={runOpen}
            size="wide"
            onDismiss={() => setRunOpen(false)}
          >
            <Run />
          </Modal>
        </motion.div>
      </HelpBeacon>
    </div>

  );
};

export default ScenariosSidebarEditAnalysis;
