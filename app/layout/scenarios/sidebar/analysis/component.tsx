import React, { useCallback, useEffect, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { useScenario, useSaveScenario } from 'hooks/scenarios';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { AnimatePresence, motion } from 'framer-motion';
import { getScenarioStatusMetaData, getReloadTab } from 'utils/utils-scenarios';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import AdjustPanningUnits from 'layout/scenarios/sidebar/analysis/adjust-planning-units';
import CostSurface from 'layout/scenarios/sidebar/analysis/cost-surface';
import GapAnalysis from 'layout/scenarios/sidebar/analysis/gap-analysis';
import Sections from 'layout/scenarios/sidebar/analysis/sections';
import Run from 'layout/scenarios/sidebar/run';

import Button from 'components/button';
import Modal from 'components/modal';

export interface ScenariosSidebarAnalysisProps {
  readOnly?: boolean;
}

export const ScenariosSidebarAnalysis: React.FC<ScenariosSidebarAnalysisProps> = ({
  readOnly,
}: ScenariosSidebarAnalysisProps) => {
  const [section, setSection] = useState(null);
  const [runOpen, setRunOpen] = useState(false);
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSubTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);
  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);
  const { metadata } = scenarioData || {};
  const { scenarioEditingMetadata } = metadata || {};

  const { tabStatus } = scenarioEditingMetadata || {};
  const { subtab: refSubtab } = tabStatus || {};

  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const saveTabsStatus = useCallback(async (subtab) => {
    saveScenarioMutation.mutate({
      id: `${sid}`,
      data: {
        metadata: getScenarioStatusMetaData(scenarioEditingMetadata, 'analysis', `${subtab}`),
      },
    }, {
      onSuccess: () => {
      },
      onError: (err) => {
        console.info(err);
      },
    });
  }, [saveScenarioMutation, sid, scenarioEditingMetadata]);

  // CALLBACKS
  const onChangeSection = useCallback((s) => {
    setSection(s);
    const subtab = s ? `analysis-${s}` : 'analysis-preview';
    dispatch(setSubTab(subtab));
    saveTabsStatus(subtab);
  }, [dispatch, setSubTab, saveTabsStatus]);

  useEffect(() => {
    return () => {
      setSection(refSubtab ? getReloadTab(refSubtab) : null);
    };
  }, [tab, refSubtab]);

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
                readOnly={readOnly}
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
                  readOnly={readOnly}
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

export default ScenariosSidebarAnalysis;
