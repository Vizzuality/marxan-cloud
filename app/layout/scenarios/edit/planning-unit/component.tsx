import React, { useCallback, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { AnimatePresence, motion } from 'framer-motion';
import { ScenarioSidebarSubTabs, ScenarioSidebarTabs } from 'utils/tabs';
import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import { useCanEditScenario } from 'hooks/permissions';
import { useSaveScenario, useScenario } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import AdjustPanningUnits from 'layout/scenarios/edit/planning-unit/adjust-planning-units';
import CostSurface from 'layout/scenarios/edit/planning-unit/cost-surface';
import ProtectedAreas from 'layout/scenarios/edit/planning-unit/protected-areas';
import Sections from 'layout/sections';

import Button from 'components/button';

const SECTIONS = [
  {
    id: ScenarioSidebarSubTabs.PROTECTED_AREAS_PREVIEW,
    name: 'Protected Areas',
    description: 'You can select current protected areas listed in World Database of Protected Areas (WCMC-UNEP) or upload your own protected area geometry.',
  },
  {
    id: ScenarioSidebarSubTabs.ADJUST_PLANNING_UNITS,
    name: 'Adjust planning units (optional)',
    description: 'The status of a planning unit determines whether it is included in every solution (i.e. locked in) or excluded (i.e. locked out). The default status is neither included or excluded but determined during the Marxan analysis.',
  },
  {
    id: ScenarioSidebarSubTabs.COST_SURFACE,
    name: 'Cost surface',
    description: 'Costs reflect any variety of socioeconomic factors, which if minimized, might help the conservation plan be implemented more effectively and reduce conflicts with other uses.',
  },
];
export interface ScenariosSidebarEditPlanningUnitProps {

}

export const ScenariosSidebarEditPlanningUnit: React.FC<ScenariosSidebarEditPlanningUnitProps> = (

) => {
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
    // Check that the subtab is a valid planning unit subtab
    if (!SECTIONS.find((s) => s.id === subtab)) {
      dispatch(setSubTab(null));
    }
  }, []); // eslint-disable-line

  // CALLBACKS
  const onChangeSection = useCallback((s) => {
    const sub = s || null;
    dispatch(setSubTab(sub));
  }, [dispatch, setSubTab]);

  const onContinue = useCallback(() => {
    scenarioMutation.mutate({
      id: `${sid}`,
      data: {
        metadata: mergeScenarioStatusMetaData(
          scenarioData?.metadata,
          {
            tab: ScenarioSidebarTabs.FEATURES,
            subtab: null,
          },
          {
            saveTab: true,
            saveStatus: false,
          },
        ),
      },
    }, {
      onSuccess: () => {
        dispatch(setTab(ScenarioSidebarTabs.FEATURES));
        dispatch(setSubTab(null));
      },
    });
  }, [sid, scenarioData?.metadata, dispatch, setTab, setSubTab, scenarioMutation]);

  if (!scenarioData || tab !== ScenarioSidebarTabs.PLANNING_UNIT) return null;

  return (
    <div className="flex flex-col flex-grow w-full h-full overflow-hidden">
      <HelpBeacon
        id="scenarios-analysis"
        title="Planning Unit"
        subtitle="Fine tune your Marxan plan"
        content={(
          <div className="space-y-2">
            <p>
              This section helps you refine your
              plan by allowing you to:
            </p>
            <ol className="pl-6 space-y-2 list-disc">
              <li>
                <p>
                  Add any existing
                  {' '}
                  <b> PROTECTED AREAS</b>
                  {' '}
                  you would
                  like to include in the plan. They will be
                  included as locked-in areas (meaning they will be
                  included in all the solutions of this scenario).
                </p>
                <p>
                  You can select current
                  protected areas listed in World Database of
                  Protected Areas (WCMC-UNEP)
                  or upload your own protected area geometry.
                </p>
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
              <li>
                Add a cost surface in
                <b> COST SURFACE</b>
              </li>
            </ol>
          </div>
        )}
        modifiers={['flip']}
        tooltipPlacement="left"
      >
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

              {!subtab && (
                <Sections
                  key="sections"
                  sections={SECTIONS}
                  onChangeSection={onChangeSection}
                />
              )}

              {(subtab === ScenarioSidebarSubTabs.PROTECTED_AREAS_PREVIEW
                || subtab === ScenarioSidebarSubTabs.PROTECTED_AREAS_THRESHOLD)
                && (
                  <ProtectedAreas
                    key="protected-areas"
                  />
                )}

              {subtab === ScenarioSidebarSubTabs.COST_SURFACE && (
                <CostSurface
                  key="cost-surface"
                  onChangeSection={onChangeSection}
                />
              )}

              {subtab === ScenarioSidebarSubTabs.ADJUST_PLANNING_UNITS && (
                <AdjustPanningUnits
                  key="adjust-planning-units"
                  onChangeSection={onChangeSection}
                />
              )}
            </Pill>

            {!subtab && editable && (
              <motion.div
                key="continue-scenario-button"
                className="flex justify-center flex-shrink-0 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Button
                  theme="primary"
                  size="lg"
                  onClick={onContinue}
                >
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

export default ScenariosSidebarEditPlanningUnit;
