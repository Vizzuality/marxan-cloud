import React from 'react';

import { motion } from 'framer-motion';

import InfoButton from 'components/info-button';
import HelpBeacon from 'layout/help/beacon';
import Section from 'layout/section';

import FEATURE_ABUND_IMG from 'images/info-buttons/img_abundance_data.png';
import FEATURE_SOCIAL_IMG from 'images/info-buttons/img_social_uses.png';
import FEATURE_SPECIES_IMG from 'images/info-buttons/img_species_range.png';

import AddFeaturesModal from './add-modal';
import ListFeatures from './list';

export const ScenariosSidebarEditFeatures = ({ onContinue }): JSX.Element => {
  return (
    <div className="flex h-full w-full flex-grow flex-col overflow-hidden">
      <HelpBeacon
        id="features"
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
            <p className="italic">
              Note on privacy: the features you upload will only be accessible inside your project
              to you and your contributors. They will not be shared with other users unless you
              publish them to the community.
            </p>
          </div>
        }
        modifiers={['flip']}
        placement="top-start"
        tooltipPlacement="right"
      >
        <motion.div
          key="features"
          className="flex flex-col overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Section className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-blue-500">Grid Setup</span>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium">Features</h3>
                  <InfoButton theme="primary" className="bg-gray-400">
                    <>
                      <h4 className="mb-2.5 font-heading text-lg">What are features?</h4>
                      <div className="space-y-2">
                        <p>
                          Features are the important habitats, species, processes, activities, and
                          discrete areas that you want to consider in your planning process. Common
                          feature data formats are range maps, polygons, abundances, and continuous
                          scale or probability of occurrence maps (e.g. 0-1). Features can include
                          more than just ecological data but also be cultural and socio-economic
                          areas like community fishing grounds or traditional-use areas, and other
                          human activities and industries. Every feature must have a minimum target
                          amount set. Some examples include:
                        </p>
                        <img src={FEATURE_SPECIES_IMG} alt="Feature-Range" />
                        <img src={FEATURE_ABUND_IMG} alt="Feature-Abundance" />
                        <img src={FEATURE_SOCIAL_IMG} alt="Feature-Social" />
                      </div>
                    </>
                  </InfoButton>
                </div>
              </div>
              <AddFeaturesModal />
            </div>

            <ListFeatures onContinue={onContinue} />
          </Section>
        </motion.div>
      </HelpBeacon>
    </div>
  );
};

export default ScenariosSidebarEditFeatures;
