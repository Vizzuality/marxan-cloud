import React, { useCallback, useState, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { AnimatePresence, motion } from 'framer-motion';
import { ScenarioSidebarTabs, ScenarioSidebarSubTabs } from 'utils/tabs';

import { useProjectRole } from 'hooks/project-users';
import { useScenario } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import AdvancedSettings from 'layout/scenarios/edit/parameters/advanced-settings';
import BLMCalibration from 'layout/scenarios/edit/parameters/blm-calibration';
import Run from 'layout/scenarios/edit/run';
import Sections from 'layout/sections';

import Button from 'components/button';
import Modal from 'components/modal';

const SECTIONS = [
  {
    id: ScenarioSidebarSubTabs.BLM_CALIBRATION,
    name: 'BLM Calibration',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In a iaculis nulla. Duis aliquam lacus massa, id sollicitudin massa.',
  },
  {
    id: ScenarioSidebarSubTabs.ADVANCED_SETTINGS,
    name: 'Advanced Settings',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In a iaculis nulla. Duis aliquam lacus massa, id sollicitudin massa.',
  },
];
export interface ScenariosSidebarEditAnalysisProps {

}

export const ScenariosSidebarEditAnalysis: React.FC<ScenariosSidebarEditAnalysisProps> = () => {
  const [runOpen, setRunOpen] = useState(false);
  const { query } = useRouter();
  const { pid, sid } = query;

  const { data: projectRole } = useProjectRole(pid);
  const VIEWER = projectRole === 'project_viewer';

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSubTab } = scenarioSlice.actions;

  const { tab, subtab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);

  useEffect(() => {
    if (!SECTIONS.find((s) => s.id === subtab)) {
      dispatch(setSubTab(null));
    }
  }, []); // eslint-disable-line

  const onChangeSection = useCallback((s) => {
    const sub = s || null;
    dispatch(setSubTab(sub));
  }, [dispatch, setSubTab]);

  if (!scenarioData || tab !== ScenarioSidebarTabs.PARAMETERS) return null;

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

              {!subtab && (
                <Sections
                  key="sections"
                  sections={SECTIONS}
                  onChangeSection={onChangeSection}
                />
              )}

              {subtab === ScenarioSidebarSubTabs.BLM_CALIBRATION && (
                <BLMCalibration
                  key="blm-calibration"
                  onChangeSection={onChangeSection}
                />
              )}

              {subtab === ScenarioSidebarSubTabs.ADVANCED_SETTINGS && (
                <AdvancedSettings
                  key="advanced-settings"
                  onChangeSection={onChangeSection}
                />
              )}

            </Pill>

            {!subtab && (
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
            size="narrow"
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
