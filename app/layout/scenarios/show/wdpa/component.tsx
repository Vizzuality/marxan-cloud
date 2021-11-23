import React, { useMemo } from 'react';

import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { motion } from 'framer-motion';

import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';

import Label from 'components/forms/label';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';

import THRESHOLD_IMG from 'images/info-buttons/img_threshold.png';

export interface ScenariosSidebarShowWDPAProps {
}

export const ScenariosSidebarShowWDPA: React.FC<ScenariosSidebarShowWDPAProps> = () => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}`]);

  const { data: projectData } = useProject(pid);
  const {
    data: scenarioData,
    isFetching: scenarioIsFetching,
    isFetched: scenarioIsFetched,
  } = useScenario(sid);

  const {
    data: wdpaData,
    isFetching: wdpaIsFetching,
    isFetched: wdpaIsFetched,
  } = useWDPACategories({
    adminAreaId: projectData?.adminAreaLevel2Id
      || projectData?.adminAreaLevel1I
      || projectData?.countryId,
    customAreaId: !projectData?.adminAreaLevel2Id
      && !projectData?.adminAreaLevel1I
      && !projectData?.countryId ? projectData?.planningAreaId : null,
    scenarioId: sid,
  });

  const selectedProtectedAreas = useMemo(() => {
    return wdpaData?.filter((pa) => pa.selected);
  }, [wdpaData]);

  if (!scenarioData || tab !== 'protected-areas') return null;

  // Loading
  if ((scenarioIsFetching && !scenarioIsFetched) || (wdpaIsFetching && !wdpaIsFetched)) {
    return (
      <Loading
        visible
        className="relative flex items-center justify-center w-full h-16"
        iconClassName="w-10 h-10 text-white"
      />
    );
  }

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

            <div className="relative flex flex-col flex-grow overflow-hidden">
              <div className="absolute top-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-b from-gray-700 via-gray-700" />

              <div className="relative px-0.5 overflow-x-visible overflow-y-auto">
                <div className="py-8 space-y-6">

                  {selectedProtectedAreas?.length === 0 && (
                    <div>
                      <p className="mb-3 text-sm text-gray-300">No protected areas has been selected.</p>
                    </div>
                  )}

                  {selectedProtectedAreas?.length > 0 && (
                    <>
                      <div>
                        <h3 className="text-xs uppercase">Selected protected areas:</h3>
                        <div className="flex flex-wrap mt-2.5">
                          {selectedProtectedAreas.map((pa) => {
                            return (
                              <div
                                key={`${pa.id}`}
                                className="flex mb-2.5 mr-5"
                              >
                                <span className="text-sm text-blue-400 bg-blue-400 bg-opacity-20 rounded-3xl px-2.5 h-6 inline-flex items-center mr-1">
                                  {pa.kind === 'global' ? `IUCN ${pa.name}` : `${pa.name}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center mb-3">
                          <Label theme="dark" className="mr-3 text-xs uppercase">Threshold for protected areas:</Label>
                          <InfoButton>
                            <div>
                              <h4 className="font-heading text-lg mb-2.5">What is a threshold?</h4>
                              <div className="space-y-2">
                                <p>
                                  Inside Marxan, planning units are considered as either
                                  protected
                                  or not protected.
                                </p>
                                <p>
                                  The threshold value represents a
                                  percentage of the area
                                  inside a planning unit. By setting the threshold you decide
                                  how much of a protected area needs to fall inside a
                                  planning unit to consider the whole planning unit
                                  as &quot;protected&quot;.
                                </p>
                                <p>
                                  The following
                                  image shows an example setting a threshold of 50%:
                                </p>
                              </div>

                              <img src={THRESHOLD_IMG} alt="Threshold" />

                            </div>
                          </InfoButton>
                        </div>

                        <p className="mb-3 text-sm text-gray-300">
                          Refers to what percentage of a planning unit must
                          {' '}
                          be covered by a protected area to be considered “protected”.
                        </p>
                        <p>{`${scenarioData?.wdpaThreshold}%`}</p>
                      </div>
                    </>
                  )}

                </div>
              </div>
              <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-t from-gray-700 via-gray-700" />
            </div>

          </Pill>
        </motion.div>
      </HelpBeacon>
    </div>
  );
};

export default ScenariosSidebarShowWDPA;
