import React from 'react';

import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { motion } from 'framer-motion';

import { useScenario } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import ScenariosSidebarShowWDPAContent from 'layout/scenarios/show/wdpa/content';

export interface ScenariosSidebarShowWDPAProps {
}

export const ScenariosSidebarShowWDPA: React.FC<ScenariosSidebarShowWDPAProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}`]);

  const { data: scenarioData } = useScenario(sid);

  if (!scenarioData || tab !== 'protected-areas') return null;

  return (
    <div className="flex flex-col flex-grow w-full h-full overflow-hidden">
      <HelpBeacon
        id="scenarios-wdpa"
        title="Protected Areas"
        subtitle="Add protected areas to the conservation plan"
        content={(
          <div className="space-y-2">
            <p>
              Add here any existing protected areas you would
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
            <p>
              If you do
              not wish to include any protected areas, click on the
              <b> Skip to features</b>
              {' '}
              button below.
            </p>

          </div>
        )}
        modifiers={['flip']}
        tooltipPlacement="left"
      >

        <motion.div
          key="protected-areas"
          className="flex flex-col min-h-0 overflow-hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >

          <Pill selected>
            <header className="flex items-baseline space-x-4">
              <h2 className="text-lg font-medium font-heading">Protected areas</h2>
            </header>

            <ScenariosSidebarShowWDPAContent />

          </Pill>
        </motion.div>
      </HelpBeacon>
    </div>
  );
};

export default ScenariosSidebarShowWDPA;
