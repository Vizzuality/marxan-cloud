import React from 'react';

import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { motion } from 'framer-motion';

import { useSelectedFeatures } from 'hooks/features';
import { useScenario } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import FeaturesAdded from 'layout/scenarios/show/features/added';

import Icon from 'components/icon';
import InfoButton from 'components/info-button';

import FEATURE_ABUND_IMG from 'images/info-buttons/img_abundance_data.png';
import FEATURE_SOCIAL_IMG from 'images/info-buttons/img_social_uses.png';
import FEATURE_SPECIES_IMG from 'images/info-buttons/img_species_range.png';

import FEATURES_SVG from 'svgs/ui/features.svg?sprite';

export interface ScenariosSidebarShowFeaturesProps {

}

export const ScenariosSidebarShowFeatures: React.FC<ScenariosSidebarShowFeaturesProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}`]);

  const { data: scenarioData } = useScenario(sid);

  const {
    data: selectedFeaturesData,
  } = useSelectedFeatures(sid, {});

  if (!scenarioData || tab !== 'features') return null;

  return (
    <div className="flex flex-col flex-grow w-full h-full overflow-hidden">
      <HelpBeacon
        id="scenarios-features"
        title="Features"
        subtitle="Add features to the conservation plan"
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
                  <h2 className="text-lg font-medium font-heading">Features Added</h2>
                  <InfoButton>
                    <div>
                      <h4 className="font-heading text-lg mb-2.5">What are features?</h4>
                      <div className="space-y-2">
                        <p>
                          Features represent everything you want to include in
                          your conservation or land/sea use plan.
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

                  <>
                    <Icon icon={FEATURES_SVG} className="w-4 h-4 text-gray-400" />
                    <div className="text-xs uppercase font-heading">
                      Features added:
                      {' '}
                      {selectedFeaturesData && <span className="ml-1 text-gray-400">{selectedFeaturesData.length}</span>}
                    </div>
                  </>

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
                      </div>
                    </InfoButton>
                    <InfoButton>
                      <div>
                        <h4 className="font-heading text-lg mb-2.5">What is the FPF?</h4>
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

                </div>
              </div>

            </header>

            <FeaturesAdded />

          </Pill>
        </motion.div>
      </HelpBeacon>
    </div>
  );
};

export default ScenariosSidebarShowFeatures;
