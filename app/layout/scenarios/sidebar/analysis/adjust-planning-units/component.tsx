import React, { useState, useCallback, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';

import { useScenarioPU, useSaveScenarioPU } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';

import LOCK_IN_OUT_IMG from 'images/info-buttons/img_lockin_lock_out.png';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';
import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

import Buttons from './buttons';
import Tabs from './tabs';

export interface ScenariosSidebarAnalysisSectionsProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosSidebarAnalysisSections: React.FC<ScenariosSidebarAnalysisSectionsProps> = ({
  onChangeSection,
}: ScenariosSidebarAnalysisSectionsProps) => {
  const [clearing, setClearing] = useState(false);

  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const {
    setPUAction,
    setPuIncludedValue,
    setPuExcludedValue,
    setTmpPuIncludedValue,
    setTmpPuExcludedValue,
  } = scenarioSlice.actions;
  const dispatch = useDispatch();
  const { puAction } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const { addToast } = useToasts();

  const { data: PUData, isFetched: PUisFetched } = useScenarioPU(sid);
  const scenarioPUMutation = useSaveScenarioPU({});

  useEffect(() => {
    if (PUData && PUisFetched) {
      const { included, excluded } = PUData;
      dispatch(setPuIncludedValue(included));
      dispatch(setPuExcludedValue(excluded));
      dispatch(setTmpPuIncludedValue(included));
      dispatch(setTmpPuExcludedValue(excluded));
    }
  }, [PUData]); //eslint-disable-line

  const onChangeTab = useCallback((t) => {
    dispatch(setPUAction(t));
  }, [dispatch, setPUAction]);

  const onClear = useCallback(() => {
    const { includedDefault, excludedDefault } = PUData;
    setClearing(true);

    // Save current clicked pu ids
    scenarioPUMutation.mutate({
      id: `${sid}`,
      data: {
        byId: {
          include: includedDefault,
          exclude: excludedDefault,
        },
      },
    }, {
      onSuccess: () => {
        addToast('clear-planning-units-success', (
          <>
            <h2 className="font-medium">Success!</h2>
            <ul className="text-sm">
              <li>Planning units cleared</li>
            </ul>
          </>
        ), {
          level: 'success',
        });
        setClearing(false);
      },
      onError: () => {
        addToast('clear-planning-units-error', (
          <>
            <h2 className="font-medium">Error!</h2>
            <ul className="text-sm">
              <li>Ooops! Something went wrong. Try again</li>
            </ul>
          </>
        ), {
          level: 'error',
        });
        setClearing(false);
      },
    });
  }, [sid, PUData, scenarioPUMutation, addToast]);

  return (
    <motion.div
      key="gap-analysis"
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="flex items-center pt-5 pb-1 space-x-3">
        <button
          type="button"
          className="flex items-center w-full space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading">Adjust planning units</h4>
        </button>
        <InfoButton>
          <div>
            <h4 className="font-heading text-lg mb-2.5">Locked-in and locked-out planning units</h4>
            <div className="space-y-2">
              <p>
                You can force Marxan to include or exclude some planning units from your analysis.
              </p>
              <p>
                Manually including or excluding individual planning units
                is useful when a real-world issue affects where new
                protected areas can be designated. For example, if
                you know that a particular planning unit contains a restricted
                military area and cannot be designated, then you could
                manually exclude that planning unit from the project.
              </p>
              <p>
                You can see the example below where a city is
                marked as locked-out and a protected area is
                marked as locked-in:
              </p>
              <img src={LOCK_IN_OUT_IMG} alt="Feature-Range" />
              <p>
                The areas selected to be included will be
                {' '}
                <b>locked in </b>
                to your conservation plan and will appear in all of the solutions.
              </p>
              <p>
                The areas selected to be excluded will be
                {' '}
                <b>locked out </b>
                of your conservation plan and will never appear in the solutions
              </p>
            </div>

          </div>
        </InfoButton>
      </header>

      <div className="w-full flex items-center justify-between border-t border-gray-500 mt-2.5">
        <Tabs
          type={puAction}
          onChange={onChangeTab}
        />

        {PUData && (!!PUData.included.length || !!PUData.excluded.length) && (
          <div>
            <Button
              theme="secondary"
              size="s"
              disabled={clearing}
              onClick={onClear}
            >
              <div className="flex items-center space-x-2">
                <span>Clear</span>
                <Icon icon={CLOSE_SVG} className="w-2 h-2" />
              </div>
            </Button>
          </div>
        )}
      </div>

      <div className="relative flex flex-col flex-grow w-full min-h-0 overflow-hidden">
        <div className="absolute top-0 left-0 z-10 w-full h-3 bg-gradient-to-b from-gray-700 via-gray-700" />
        <div className="relative px-0.5 overflow-x-visible overflow-y-auto">
          <div className="py-3">
            <Buttons
              type={puAction}
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 z-10 w-full h-3 bg-gradient-to-t from-gray-700 via-gray-700" />
      </div>

    </motion.div>
  );
};

export default ScenariosSidebarAnalysisSections;
