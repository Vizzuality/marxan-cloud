import React, { useCallback, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { useScenario } from 'hooks/scenarios';
import {
  useSolutions,
  useBestSolution,
  useMostDifferentSolutions,
  useDownloadSolutions,
} from 'hooks/solutions';
import { useToasts } from 'hooks/toast';

import { Button } from 'components/button/component';
import Checkbox from 'components/forms/checkbox';
import Label from 'components/forms/label';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';
import NoResults from 'layout/project/sidebar/project/inventory-panel/components/no-results';

import FIVE_DIFF_SOLUTIONS_IMG from 'images/info-buttons/img_5_different_solutions.png';

import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

import SolutionsTable from '..';

import { SolutionsTableFormProps } from './types';

export const SolutionsTableForm: React.FC<SolutionsTableFormProps> = ({
  onCancel,
  setShowTable,
}: SolutionsTableFormProps) => {
  const { addToast } = useToasts();

  const [mostDifSolutions, setMostDifSolutions] = useState<boolean>(false);
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSelectedSolution } = scenarioSlice.actions;
  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);

  const { data: bestSolutionData } = useBestSolution(sid, {
    enabled: scenarioData?.ranAtLeastOnce,
  });

  const { selectedSolution } = useSelector((state) => state[`/scenarios/${sid}/edit`]);
  const [selectSolution, setSelectSolution] = useState(
    selectedSolution?.id || bestSolutionData?.id
  );

  const {
    data: solutionsData,
    isFetching: solutionsAreFetching,
    isFetched: solutionsAreFetched,
  } = useSolutions(sid);

  const {
    data: mostDifSolutionsData,
    isFetching: mostDifSolutionsAreFetching,
    isFetched: mostDifSolutionsAreFetched,
  } = useMostDifferentSolutions(sid);

  const allSolutionsFetched = solutionsAreFetched || mostDifSolutionsAreFetched;

  const noSolutionResults =
    (solutionsAreFetched && !solutionsData.length) ||
    (mostDifSolutionsAreFetched && !mostDifSolutionsData.length);

  const solutionsAreLoading = solutionsAreFetching || mostDifSolutionsAreFetching;

  const downloadSolutionsMutation = useDownloadSolutions({});

  const onSave = useCallback(() => {
    dispatch(setSelectedSolution(selectSolution));
    setShowTable(false);
  }, [dispatch, selectSolution, setSelectedSolution, setShowTable]);

  const onDownload = useCallback(() => {
    downloadSolutionsMutation.mutate(
      { id: `${sid}` },
      {
        onSuccess: () => {},
        onError: () => {
          addToast(
            'download-error',
            <>
              <h2 className="font-medium">Error!</h2>
              <ul className="text-sm">Template not downloaded</ul>
            </>,
            {
              level: 'error',
            }
          );
        },
      }
    );
  }, [sid, downloadSolutionsMutation, addToast]);

  return (
    <div className="relative mt-8 flex flex-grow flex-col overflow-hidden text-gray-900">
      <div className="relative flex flex-grow flex-col overflow-hidden overflow-y-auto overflow-x-hidden">
        <div className="flex-column items-center space-y-6 px-8 pb-8">
          <div className="flex items-center space-x-3">
            <h2 className="font-heading text-2xl">Solutions Table:</h2>
            <InfoButton theme="secondary">
              <div>
                <p>
                  Each solution gives an alternative answer to your planning problem. The result of
                  each solution reflects whether a planning unit is selected or not in the
                  conservation network.
                </p>
                <p>
                  The table shows a summary of the most informative variables for each solution
                  including:
                </p>
                <ul className="list-disc space-y-1 pl-6">
                  <li>
                    <b>Score:</b> the answer to Marxan&apos;s mathematical objective function.
                    Simply put it is the sum of the three terms: 1) the sum of the costs of the
                    selected planning units; 2) the total perimeter of the selected planning units;
                    and 3) the total penalty incurred if conservation targets are not met.
                  </li>
                  <li>
                    <b>Cost:</b> the sum of the costs of the selected planning units
                  </li>
                  <li>
                    <b>Missing Values:</b> number of features that don&apos;t meet their target
                  </li>
                  <li>
                    <b>Planning Units:</b>
                    number of planning units selected
                  </li>
                </ul>
                <p>
                  When you click on &apos;View on map&apos; you will see the distribution of the
                  selected planning units on the map
                </p>
                <p>
                  <i>
                    The files are equivalent to the output_xxxx.csv from the generic Marxan outputs.
                  </i>
                </p>
              </div>
            </InfoButton>
          </div>

          {!noSolutionResults && (
            <div className="flex items-center justify-between space-x-8">
              <div className="flex items-center">
                <Checkbox
                  theme="light"
                  id="checkbox-5-dif-solutions"
                  className="form-checkbox-dark block h-4 w-4 text-green-400"
                  onChange={(event) => setMostDifSolutions(event.target.checked)}
                />
                <Label
                  id="checkbox-5-dif-solutions"
                  className="mx-2 cursor-pointer text-sm text-gray-800 hover:underline"
                >
                  View 5 most different solutions
                </Label>

                <InfoButton theme="secondary">
                  <div>
                    <h4 className="mb-2.5 font-heading text-lg">Five different solutions</h4>
                    <div className="space-y-2">
                      <p className="mb-6">
                        One of Marxan’s advantages is that it creates a range of good solutions that
                        can be presented to decision-makers. With this feature you can automatically
                        call the 5 most different solutions that meet your objectives. These are
                        identified through a 5 group cluster analysis and the solution with the
                        lowest score is used as the representative solution of the group.
                      </p>
                      <img src={FIVE_DIFF_SOLUTIONS_IMG} alt="Five different solutions" />
                    </div>
                  </div>
                </InfoButton>
              </div>

              <Button
                theme="secondary"
                size="base"
                className="flex items-center justify-between pl-4 pr-4"
                onClick={onDownload}
                disabled={noSolutionResults}
              >
                Download solutions
                <Icon icon={DOWNLOAD_SVG} className="ml-8 h-5 w-5 text-white" />
              </Button>
            </div>
          )}
        </div>
        <div className="relative">
          {solutionsAreLoading && (
            <div className="absolute left-0 top-0 z-30 flex h-full w-full flex-col items-center justify-center">
              <Loading
                visible
                className="z-40 flex w-full items-center justify-center "
                iconClassName="w-10 h-10 text-primary-500"
              />
              <div className="mt-5 font-heading text-xs uppercase">Loading Solutions</div>
            </div>
          )}

          {noSolutionResults && <NoResults />}

          {allSolutionsFetched && !noSolutionResults && (
            <SolutionsTable
              bestSolutionId={bestSolutionData?.id}
              body={mostDifSolutions ? mostDifSolutionsData : solutionsData}
              selectedSolution={selectSolution}
              onSelectSolution={(solution) => setSelectSolution(solution)}
            />
          )}
        </div>
      </div>

      {!noSolutionResults && (
        <div className="flex w-full items-center justify-center pt-8">
          <Button theme="secondary" size="lg" onClick={() => onCancel()}>
            Cancel
          </Button>
          <Button theme="primary" size="lg" onClick={() => onSave()} className="ml-4">
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default SolutionsTableForm;
