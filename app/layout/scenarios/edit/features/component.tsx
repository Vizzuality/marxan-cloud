import React, { useState, useEffect, useCallback } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';
import { ScenarioSidebarSubTabs, ScenarioSidebarTabs } from 'utils/tabs';
import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import { useSelectedFeatures } from 'hooks/features';
import { useScenario, useSaveScenario } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import AddFeaturesModal from 'layout/scenarios/edit/features/add';
import ListFeatures from 'layout/scenarios/edit/features/list';
import TargetFeatures from 'layout/scenarios/edit/features/targets';

import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Steps from 'components/steps';

import FEATURE_ABUND_IMG from 'images/info-buttons/img_abundance_data.png';
import FEATURE_SOCIAL_IMG from 'images/info-buttons/img_social_uses.png';
import FEATURE_SPECIES_IMG from 'images/info-buttons/img_species_range.png';

import FEATURES_SVG from 'svgs/ui/features.svg?sprite';

export interface ScenariosSidebarEditFeaturesProps {

}

export const ScenariosSidebarEditFeatures: React.FC<ScenariosSidebarEditFeaturesProps> = () => {
  const [step, setStep] = useState(0);
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSubTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);
  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);
  const { metadata } = scenarioData || {};
  const { scenarioEditingMetadata } = metadata || {};
  const {
    subtab: metaSubtab,
  } = scenarioEditingMetadata || {};

  const {
    data: selectedFeaturesData,
  } = useSelectedFeatures(sid, {});

  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const saveScenarioStatusOnBack = useCallback(async () => {
    saveScenarioMutation.mutate({
      id: `${sid}`,
      data: {
        metadata: mergeScenarioStatusMetaData(metadata, {
          tab: ScenarioSidebarTabs.FEATURES,
          subtab: 'features-preview',
        }),
      },
    });
  }, [saveScenarioMutation, sid, metadata]);

  useEffect(() => {
    setStep(metaSubtab === 'features-fpf' ? 1 : 0);
  }, [metaSubtab]);

  if (!scenarioData || tab !== ScenarioSidebarTabs.FEATURES) return null;

  return (
    <div className="flex flex-col flex-grow w-full h-full overflow-hidden">
      <HelpBeacon
        id="scenarios-features"
        title="Features"
        subtitle="Manage features"
        content={(
          <div className="space-y-2">
            <p>
              Features are everything you want to include in
              your conservation or land/sea use plan such as
              species ranges, habitats or ecoregions.
            </p>
            <p>
              The first step requires adding features.
              There are public features available for use that
              you can access directly
              or you can upload your private features as a shapefile.
            </p>
            <p>
              The second step of this section requires setting a
              conservation target and feature penalty factor for
              each feature.
            </p>
            <p>
              <i>
                Note on privacy: The features you upload will only
                be accessible inside your project to you and your
                contributors. They will not be shared with other users.
              </i>
            </p>

          </div>
        )}
        modifiers={['flip']}
        tooltipPlacement="left"
      >
        <motion.div
          key="features"
          className="flex flex-col min-h-0 overflow-hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Pill selected>
            <header className="flex items-start justify-between flex-shrink-0">
              <div>
                <div className="flex items-baseline space-x-4">
                  <h2 className="text-lg font-medium font-heading">Features</h2>
                  <Steps step={step + 1} length={2} />
                  <InfoButton>
                    <div>
                      <h4 className="font-heading text-lg mb-2.5">What are features?</h4>
                      <div className="space-y-2">
                        <p>
                          Features are the important habitats, species, processes,
                          activities, and discrete areas that you want to consider
                          in your planning process. Common feature data formats are
                          range maps, polygons, abundances, and continuous scale or
                          probability of occurrence maps (e.g. 0-1). Features can
                          include more than just ecological data but also be cultural
                          and socio-economic areas like community fishing grounds
                          or traditional-use areas, and other human activities and
                          industries. Every feature must have a minimum target
                          amount set.
                          Some examples include:
                        </p>
                        <img src={FEATURE_SPECIES_IMG} alt="Feature-Range" />
                        <img src={FEATURE_ABUND_IMG} alt="Feature-Abundance" />
                        <img src={FEATURE_SOCIAL_IMG} alt="Feature-Social" />
                      </div>
                    </div>
                  </InfoButton>
                </div>

                <div className="flex items-center mt-2 space-x-2">

                  {step === 0 && (
                    <>
                      <Icon icon={FEATURES_SVG} className="w-4 h-4 text-gray-400" />
                      <div className="text-xs uppercase font-heading">
                        Features added:
                        {' '}
                        {selectedFeaturesData && <span className="ml-1 text-gray-400">{selectedFeaturesData.length}</span>}
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <div className="text-xs uppercase font-heading">
                      Set the target and FPF for your features.

                    </div>

                  )}
                  {step === 1 && (
                    <>
                      <InfoButton>
                        <div>
                          <h4 className="font-heading text-lg mb-2.5">What is a target?</h4>
                          <div className="space-y-2">
                            <p>
                              This value represents how much you want to conserve of a particular
                              feature. In an ideal conservation, land or sea use plan,
                              all your features meet their targets.
                            </p>
                            <p>
                              You can set a default
                              value for all of your features
                              or you can set individual the targets separately for each feature.
                              You can set your targets to 100% if you want the whole extent of
                              your feature to be included in the solution.
                            </p>
                          </div>
                          <h4 className="font-heading text-lg mt-5 mb-2.5">What is the FPF?</h4>
                          <div className="space-y-2">
                            <p>
                              FPF stands for
                              {' '}
                              <b>Feature Penalty Factor</b>
                              .
                              A higher FPF value forces the Marxan algorithm
                              to choose the planning units where this feature
                              is present by applying a penalty if the target
                              is missed, thereby increasing
                              the cost of the solution. It comes into play when
                              some of your targets fail to be met.
                            </p>
                            <p>
                              In a typical
                              workflow you start out with all FPF values set at
                              1 and after checking the results, increase the FPF
                              values for the particular features where targets have
                              been missed.
                            </p>
                          </div>
                        </div>
                      </InfoButton>
                    </>
                  )}

                </div>
              </div>

              {step === 0 && (
                <AddFeaturesModal />
              )}
            </header>

            {step === 0 && (
              <ListFeatures
                onSuccess={() => {
                  setStep(step + 1);
                  dispatch(setSubTab(ScenarioSidebarSubTabs.FEATURES_FPF));
                }}
              />
            )}

            {step === 1 && (
              <TargetFeatures
                onBack={() => {
                  setStep(step - 1);
                  dispatch(setSubTab(ScenarioSidebarSubTabs.FEATURES_PREVIEW));
                  saveScenarioStatusOnBack();
                }}
                onSuccess={() => {
                  console.info('success');
                }}
              />
            )}
          </Pill>
        </motion.div>
      </HelpBeacon>
    </div>
  );
};

export default ScenariosSidebarEditFeatures;
