import React, { useCallback, useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { useScenario } from 'hooks/scenarios';

import { AnimatePresence, motion } from 'framer-motion';

import Pill from 'layout/pill';
import AdjustPanningUnits from 'layout/scenarios/sidebar/analysis/adjust-planning-units';
import CostSurface from 'layout/scenarios/sidebar/analysis/cost-surface';
import GapAnalysis from 'layout/scenarios/sidebar/analysis/gap-analysis';
import Sections from 'layout/scenarios/sidebar/analysis/sections';
import Run from 'layout/scenarios/sidebar/run';

import Button from 'components/button';
import Modal from 'components/modal';

export interface ScenariosSidebarAnalysisProps {
  readOnly: boolean;
}

export const ScenariosSidebarAnalysis: React.FC<ScenariosSidebarAnalysisProps> = ({
  readOnly,
}: ScenariosSidebarAnalysisProps) => {
  const [section, setSection] = useState(null);
  const [runOpen, setRunOpen] = useState(false);
  const { query } = useRouter();
  const { sid } = query;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const { data: scenarioData } = useScenario(sid);

  // CALLBACKS
  const onChangeSection = useCallback((s) => {
    setSection(s);
  }, []);

  useEffect(() => {
    return () => {
      setSection(null);
    };
  }, [tab]);

  if (!scenarioData || tab !== 'analysis') return null;

  return (
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
              readOnly={readOnly}
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
  );
};

export default ScenariosSidebarAnalysis;
