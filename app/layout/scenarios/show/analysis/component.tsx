import React, { useCallback, useEffect, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioSlice } from 'store/slices/scenarios/detail';

import { AnimatePresence, motion } from 'framer-motion';

import { useScenario } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import AdjustPanningUnitsShow from 'layout/scenarios/show/analysis/adjust-planning-units';
import CostSurface from 'layout/scenarios/show/analysis/cost-surface';
import GapAnalysis from 'layout/scenarios/show/analysis/gap-analysis';
import Sections from 'layout/sections';

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

export interface ScenariosSidebarShowAnalysisProps {
}

export const ScenariosSidebarShowAnalysis: React.FC<ScenariosSidebarShowAnalysisProps> = () => {
  const [section, setSection] = useState(null);
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioSlice(sid);
  const { setSubTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}`]);
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
                <AdjustPanningUnitsShow
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
