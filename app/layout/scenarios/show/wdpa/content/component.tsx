import React, { useMemo, useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

import Label from 'components/forms/label';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';

import THRESHOLD_IMG from 'images/info-buttons/img_threshold.png';

export interface ScenariosSidebarShowWDPAContentProps {

}

export const ScenariosSidebarShowWDPAContent: React.FC<ScenariosSidebarShowWDPAContentProps> = (

) => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const { data: projectData } = useProject(pid);

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setWDPAThreshold } = scenarioSlice.actions;
  const dispatch = useDispatch();

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
  });

  const WDPA_CATEGORIES_OPTIONS = useMemo(() => {
    if (!wdpaData) return [];

    return wdpaData.map((w) => ({
      label: `IUCN ${w.iucnCategory}`,
      value: w.id,
    }));
  }, [wdpaData]);

  useEffect(() => {
    const { wdpaThreshold } = scenarioData;

    dispatch(setWDPAThreshold(wdpaThreshold ? wdpaThreshold / 100 : 0.75));
  }, [scenarioData]); //eslint-disable-line

  // Loading
  if ((scenarioIsFetching && !scenarioIsFetched) || (wdpaIsFetching && !wdpaIsFetched)) {
    return (
      <Loading
        visible
        className="relative flex items-center justify-center w-full h-16"
        iconClassName="w-5 h-5 text-white"
      />
    );
  }

  return (

    <div className="relative flex flex-col flex-grow overflow-hidden">
      <div className="absolute top-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-b from-gray-700 via-gray-700" />

      <div className="relative px-0.5 overflow-x-visible overflow-y-auto">
        <div className="py-8 space-y-6">

          {!scenarioData.wdpaIucnCategories && (
            <div>
              <p className="mb-3 text-sm text-gray-300">No protected areas has been selected.</p>
            </div>
          )}
          {scenarioData.wdpaIucnCategories && (
            <>
              <div>
                <h3 className="text-xs uppercase">Selected protected areas:</h3>
                <div className="flex flex-wrap mt-2.5">
                  {scenarioData && scenarioData?.wdpaIucnCategories
                    && scenarioData.wdpaIucnCategories.map((w) => {
                      const wdpa = WDPA_CATEGORIES_OPTIONS.find((o) => o.value === w);

                      if (!wdpa) return null;

                      return (
                        <div
                          key={`${wdpa.value}`}
                          className="flex mb-2.5 mr-5"
                        >
                          <span className="text-sm text-blue-400 bg-blue-400 bg-opacity-20 rounded-3xl px-2.5 h-6 inline-flex items-center mr-1">
                            {wdpa.label}
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

  );
};

export default ScenariosSidebarShowWDPAContent;
