import React from 'react';

import { useRouter } from 'next/router';

import cx from 'classnames';

import { useSelectedFeatures } from 'hooks/features';

import ShowTargetItem from 'components/features/show-target-spf-item';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';

export interface ScenariosFeaturesListProps {

}

export const ScenariosFeaturesList: React.FC<ScenariosFeaturesListProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const {
    data: selectedFeaturesData,
    isFetching: selectedFeaturesIsFetching,
    isFetched: selectedFeaturesIsFetched,
  } = useSelectedFeatures(sid, {});

  if (selectedFeaturesIsFetching && !selectedFeaturesIsFetched) {
    return (
      <Loading
        visible
        className="z-40 flex items-center justify-center w-full h-40 bg-transparent bg-opacity-90"
        iconClassName="w-5 h-5 text-primary-500"
      />
    );
  }

  return (
    <>
      {(!selectedFeaturesData || !selectedFeaturesData.length) && (
      <div className="flex items-center justify-center w-full h-40 text-sm uppercase">
        No results found
      </div>
      )}

      {!!selectedFeaturesData && !!selectedFeaturesData.length && (
      <div className="relative flex flex-col flex-grow overflow-hidden">
        <div className="absolute top-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-b from-gray-700 via-gray-700" />
        <div className="relative h-full px-0.5 overflow-x-visible overflow-y-auto">

          <div className="py-6">
            {selectedFeaturesData && selectedFeaturesData.length
            && selectedFeaturesData.map((f, i) => (
              <div key={`${f.id}`} className="space-y-4">
                <div className="flex items-baseline space-x-4">
                  <p>{f.name}</p>
                  {i === 0 && (
                    <div className="flex items-center mt-2 space-x-2">
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
                    </div>
                  )}
                </div>
                <div>
                  {f.intersectFeaturesSelected
                  && f.intersectFeaturesSelected.map((item, itemIndex) => {
                    const {
                      id, label, marxanSettings: { fpf, prop },
                    } = item;
                    return (
                      <div
                        className={cx({
                          'mt-1.5': itemIndex !== 0,
                        })}
                        key={`${id}`}
                      >
                        <ShowTargetItem
                          fpf={fpf}
                          target={prop}
                          name={label}
                          type={f.type}
                          {...item}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
        <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-t from-gray-700 via-gray-700" />
      </div>
      )}
    </>
  );
};

export default ScenariosFeaturesList;
