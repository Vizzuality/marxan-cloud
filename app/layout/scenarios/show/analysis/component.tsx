import React, { useCallback, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { AnimatePresence, motion } from 'framer-motion';
import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import { useScenario, useSaveScenario } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import AdjustPanningUnits from 'layout/scenarios/show/analysis/adjust-planning-units';
import CostSurface from 'layout/scenarios/show/analysis/cost-surface';
import GapAnalysis from 'layout/scenarios/show/analysis/gap-analysis';
import Sections from 'layout/scenarios/show/analysis/sections';

export interface ScenariosSidebarShowAnalysisProps {
}

export const ScenariosSidebarShowAnalysis: React.FC<ScenariosSidebarShowAnalysisProps> = () => {
  const [section, setSection] = useState(null);
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSubTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);
  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);
  const { metadata } = scenarioData || {};

  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const saveTabsStatus = useCallback(async (subtab) => {
    saveScenarioMutation.mutate({
      id: `${sid}`,
      data: {
        metadata: mergeScenarioStatusMetaData(metadata, { tab: 'analysis', subtab: `${subtab}` }),
      },
    });
  }, [saveScenarioMutation, sid, metadata]);

  // CALLBACKS
  const onChangeSection = useCallback((s) => {
    setSection(s);
    const subtab = s ? `analysis-${s}` : 'analysis-preview';
    dispatch(setSubTab(subtab));
    saveTabsStatus(subtab);
  }, [dispatch, setSubTab, saveTabsStatus]);

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
          </AnimatePresence>

        </motion.div>
      </HelpBeacon>
    </div>

  );
};

export default ScenariosSidebarShowAnalysis;
