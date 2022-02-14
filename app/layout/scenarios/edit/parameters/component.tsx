import React, { useCallback, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { AnimatePresence, motion } from 'framer-motion';
import { usePlausible } from 'next-plausible';
import { ScenarioSidebarTabs, ScenarioSidebarSubTabs } from 'utils/tabs';

import { useMe } from 'hooks/me';
import { useProjectRole } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenario, useSaveScenario, useRunScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import AdvancedSettings from 'layout/scenarios/edit/parameters/advanced-settings';
import BLMCalibration from 'layout/scenarios/edit/parameters/blm-calibration';
import Sections from 'layout/sections';

import Button from 'components/button';

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
  const { addToast } = useToasts();
  const plausible = usePlausible();
  const { query } = useRouter();
  const { pid, sid } = query;

  const { user } = useMe();

  const { data: projectData } = useProject(pid);
  const { data: projectRole } = useProjectRole(pid);
  const VIEWER = projectRole === 'project_viewer';

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSubTab } = scenarioSlice.actions;

  const { tab, subtab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);
  const { metadata } = scenarioData || {};
  const { marxanInputParameterFile: runSettings, scenarioEditingMetadata } = metadata || {};

  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const runScenarioMutation = useRunScenario({});

  useEffect(() => {
    if (!SECTIONS.find((s) => s.id === subtab)) {
      dispatch(setSubTab(null));
    }
  }, []); // eslint-disable-line

  const onChangeSection = useCallback((s) => {
    const sub = s || null;
    dispatch(setSubTab(sub));
  }, [dispatch, setSubTab]);

  const onRunScenario = useCallback(() => {
    const data = {
      numberOfRuns: runSettings.NUMREPS,
      boundaryLengthModifier: runSettings.BLM,
      metadata: {
        scenarioEditingMetadata: {
          ...scenarioEditingMetadata,
          lastJobCheck: new Date().getTime(),
          tab: ScenarioSidebarTabs.PARAMETERS,
          subtab: null,
        },
        marxanInputParameterFile: runSettings,
      },
    };

    saveScenarioMutation.mutate({ id: `${sid}`, data }, {
      onSuccess: () => {
        runScenarioMutation.mutate({ id: `${sid}` }, {
          onSuccess: ({ data: { data: s } }) => {
            addToast('run-start', (
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Run started</p>
              </>
            ), {
              level: 'success',
            });
            console.info('Scenario runned succesfully', s);

            plausible('Run scenario', {
              props: {
                userId: `${user.id}`,
                userEmail: `${user.email}`,
                projectId: `${pid}`,
                projectName: `${projectData.name}`,
                scenarioId: `${sid}`,
                scenarioName: `${scenarioData?.name}`,
              },
            });
          },
          onError: () => {
            addToast('error-run-start', (
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">Scenario run failed</p>
              </>
            ), {
              level: 'error',
            });
          },
        });
      },
      onError: () => { },
    });
  }, [
    pid,
    sid,
    saveScenarioMutation,
    runScenarioMutation,
    addToast,
    plausible,
    projectData?.name,
    user?.email,
    user?.id,
    scenarioData?.name,
    runSettings,
    scenarioEditingMetadata,
  ]);

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
                  onClick={onRunScenario}
                >
                  Run scenario
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </HelpBeacon>
    </div>

  );
};

export default ScenariosSidebarEditAnalysis;
