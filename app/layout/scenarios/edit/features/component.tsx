import React, { useCallback, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { AnimatePresence, motion } from 'framer-motion';

import { useCanEditScenario } from 'hooks/permissions';
import { useSaveScenario, useScenario } from 'hooks/scenarios';

import Button from 'components/button';
import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import GapAnalysis from 'layout/scenarios/edit/features/gap-analysis';
import SetUpFeatures from 'layout/scenarios/edit/features/set-up';
import Sections from 'layout/sections';
import { ScenarioSidebarSubTabs, ScenarioSidebarTabs } from 'utils/tabs';
import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

const SECTIONS = [
  {
    id: ScenarioSidebarSubTabs.FEATURES_ADD,
    name: 'Set up features',
    description:
      'Add conservation features, set targets, and penalty Factors and vizualise feature distributions.',
  },
  {
    id: ScenarioSidebarSubTabs.PRE_GAP_ANALYSIS,
    name: 'Gap Analysis',
    description:
      'A gap analysis shows the percentage of each feature that is currently inside the selected conservation network (the conservation areas that were added in the Protected Areas step and/or locked-in planning units). These amounts are shown in relation to the targets.',
  },
];
export interface ScenariosSidebarFeaturesProps {}

export const ScenariosSidebarFeatures: React.FC<ScenariosSidebarFeaturesProps> = () => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setTab, setSubTab } = scenarioSlice.actions;

  const { tab, subtab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);
  const dispatch = useDispatch();

  const editable = useCanEditScenario(pid, sid);
  const { data: scenarioData } = useScenario(sid);
  const scenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  // EFFECTS
  useEffect(() => {
    // Check that the subtab is a valid features subtab
    if (!SECTIONS.find((s) => s.id === subtab)) {
      dispatch(setSubTab(null));
    }
  }, []); // eslint-disable-line

  // CALLBACKS
  const onChangeSection = useCallback(
    (s) => {
      const sub = s || null;
      dispatch(setSubTab(sub));
    },
    [dispatch, setSubTab]
  );

  const onContinue = useCallback(() => {
    scenarioMutation.mutate(
      {
        id: `${sid}`,
        data: {
          metadata: mergeScenarioStatusMetaData(
            scenarioData?.metadata,
            {
              tab: ScenarioSidebarTabs.PARAMETERS,
              subtab: null,
            },
            {
              saveTab:
                scenarioData?.metadata?.scenarioEditingMetadata?.status?.solutions !== 'draft',
              saveStatus: false,
            }
          ),
        },
      },
      {
        onSuccess: () => {
          dispatch(setTab(ScenarioSidebarTabs.PARAMETERS));
          dispatch(setSubTab(null));
        },
      }
    );
  }, [sid, scenarioData?.metadata, dispatch, setTab, setSubTab, scenarioMutation]);

  if (!scenarioData || tab !== ScenarioSidebarTabs.FEATURES) return null;

  return (
    <div className="flex h-full w-full flex-grow flex-col overflow-hidden">
      <HelpBeacon
        id="scenarios-features"
        title="Features"
        subtitle="Manage features"
        content={
          <div className="space-y-2">
            <p>
              Features are the important habitats, species, processes, activities, and discrete
              areas that you want to consider in your planning process.
            </p>
            <p>
              You can add feaures in the Set Up Features step, set targets for them and run gap
              anlayses.
            </p>
            <p>
              <i>
                Note on privacy: the features you upload will only be accessible inside your project
                to you and your contributors. They will not be shared with other users unless you
                publish them to the community.
              </i>
            </p>
          </div>
        }
        modifiers={['flip']}
        tooltipPlacement="left"
      >
        <motion.div
          key="planning-unit"
          className="flex min-h-0 flex-col overflow-hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AnimatePresence>
            <Pill selected>
              {!subtab && (
                <>
                  <header className="flex flex-shrink-0 justify-between">
                    <div>
                      <div className="flex items-baseline space-x-4">
                        <h2 className="font-heading text-lg font-medium">Features</h2>
                      </div>
                    </div>
                  </header>
                  <Sections key="sections" sections={SECTIONS} onChangeSection={onChangeSection} />
                </>
              )}

              {(subtab === ScenarioSidebarSubTabs.FEATURES_ADD ||
                subtab === ScenarioSidebarSubTabs.FEATURES_TARGET) && (
                <SetUpFeatures key="set-up-features" />
              )}

              {subtab === ScenarioSidebarSubTabs.PRE_GAP_ANALYSIS && (
                <GapAnalysis key="gap-analysis" onChangeSection={onChangeSection} />
              )}
            </Pill>

            {!subtab && editable && (
              <motion.div
                key="continue-scenario-button"
                className="mt-4 flex flex-shrink-0 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Button theme="primary" size="lg" onClick={onContinue}>
                  Continue
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </HelpBeacon>
    </div>
  );
};

export default ScenariosSidebarFeatures;
