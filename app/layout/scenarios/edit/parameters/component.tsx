import React, { useCallback, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { AnimatePresence, motion } from 'framer-motion';
import { usePlausible } from 'next-plausible';

import { useMe } from 'hooks/me';
import { useCanEditScenario } from 'hooks/permissions';
import { useProject } from 'hooks/projects';
import { useScenario, useSaveScenario, useRunScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import AdvancedSettings from 'layout/scenarios/edit/parameters/advanced-settings';
import BLMCalibration from 'layout/scenarios/edit/parameters/blm-calibration';
import Sections from 'layout/sections';
import { ScenarioSidebarTabs, ScenarioSidebarSubTabs } from 'utils/tabs';
import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

const SECTIONS = [
  {
    id: ScenarioSidebarSubTabs.BLM_CALIBRATION,
    name: 'BLM Calibration',
    description:
      'The boundary length modifier (BLM) adjusts the level of compectness of your plan. You can cailbrate the  BLM value and vizualise the impacts on your plan.',
  },
  {
    id: ScenarioSidebarSubTabs.ADVANCED_SETTINGS,
    name: 'Advanced Settings',
    description:
      'If desirable, you can adjust the runs, iterations and other default Marxan paramters. We recommend consulting the Marxan Manual before adjusting he default values.',
  },
];
export interface ScenariosSidebarEditAnalysisProps {}

export const ScenariosSidebarEditAnalysis: React.FC<ScenariosSidebarEditAnalysisProps> = () => {
  const { addToast } = useToasts();
  const plausible = usePlausible();
  const { query } = useRouter();
  const { pid, sid } = query;

  const { user } = useMe();

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSubTab } = scenarioSlice.actions;

  const { tab, subtab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const dispatch = useDispatch();

  const editable = useCanEditScenario(pid, sid);
  const { data: projectData } = useProject(pid);

  const { data: scenarioData } = useScenario(sid);
  const { metadata, solutionsAreLocked } = scenarioData || {};
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

  const onChangeSection = useCallback(
    (s) => {
      const sub = s || null;
      dispatch(setSubTab(sub));
    },
    [dispatch, setSubTab]
  );

  const onRunScenario = useCallback(() => {
    const meta = {
      scenarioEditingMetadata,
      marxanInputParameterFile: runSettings,
    };

    const data = {
      numberOfRuns: runSettings.NUMREPS,
      boundaryLengthModifier: runSettings.BLM,
      metadata: mergeScenarioStatusMetaData(meta, {
        tab: ScenarioSidebarTabs.PARAMETERS,
        subtab: null,
      }),
    };

    saveScenarioMutation.mutate(
      { id: `${sid}`, data },
      {
        onSuccess: () => {
          runScenarioMutation.mutate(
            { id: `${sid}` },
            {
              onSuccess: ({ data: { data: s } }) => {
                addToast(
                  'run-start',
                  <>
                    <h2 className="font-medium">Success!</h2>
                    <p className="text-sm">Run started</p>
                  </>,
                  {
                    level: 'success',
                  }
                );
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
                addToast(
                  'error-run-start',
                  <>
                    <h2 className="font-medium">Error!</h2>
                    <p className="text-sm">Scenario run failed</p>
                  </>,
                  {
                    level: 'error',
                  }
                );
              },
            }
          );
        },
        onError: () => {},
      }
    );
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
    <div className="flex h-full w-full flex-grow flex-col overflow-hidden">
      <HelpBeacon
        id="run-settings"
        title="Parameters"
        subtitle="Marxan settings"
        content={
          <div className="space-y-2">
            <p>Before you run Marxan, you can adjust some parameters.</p>
            <p>
              Everything is pre-set to the default values recommended by the Marxan manual, but you
              can choose other allowed values.
            </p>
            <p>
              Please see info buttons and refer to the Marxan resources available from the marxan
              solutions website for more information on settings.
            </p>
          </div>
        }
        beaconClassName="z-50"
        modifiers={['flip']}
        tooltipPlacement="right"
      >
        <motion.div
          key="parameters"
          className="flex min-h-0 flex-col overflow-hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AnimatePresence>
            <Pill selected>
              <header className="flex flex-shrink-0 justify-between">
                <div>
                  <div className="flex items-baseline space-x-4">
                    <h2 className="font-heading text-lg font-medium">Parameters</h2>
                  </div>
                </div>
              </header>

              {!subtab && (
                <Sections key="sections" sections={SECTIONS} onChangeSection={onChangeSection} />
              )}

              {subtab === ScenarioSidebarSubTabs.BLM_CALIBRATION && (
                <BLMCalibration key="blm-calibration" onChangeSection={onChangeSection} />
              )}

              {subtab === ScenarioSidebarSubTabs.ADVANCED_SETTINGS && (
                <AdvancedSettings key="advanced-settings" onChangeSection={onChangeSection} />
              )}
            </Pill>

            {!subtab && editable && (
              <motion.div
                key="run-scenario-button"
                className="mt-4 flex flex-shrink-0 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Button
                  theme="spacial"
                  size="lg"
                  disabled={solutionsAreLocked}
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
