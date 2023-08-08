import { useCallback } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';
import type { PUAction } from 'store/slices/scenarios/types';

import { useDeletePUScenaro, useScenarioPU } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import type { ButtonProps } from 'components/button';
import Icon from 'components/icon';
import { cn } from 'utils/cn';

import HEXAGON_SVG from 'svgs/map/hexagon.svg?sprite';
import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

import ActionsSummaryButtons from './buttons';

export const ActionsSummary = ({
  method,
}: {
  method: 'draw' | 'upload' | 'select';
}): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };
  const { addToast } = useToasts();

  const scenarioSlice = getScenarioEditSlice(sid);
  const {
    setTmpPuIncludedValue,
    setTmpPuExcludedValue,
    setTmpPuAvailableValue,
    setJob,
    setDrawing,
    setDrawingValue,
    setUploading,
    setUploadingValue,
  } = scenarioSlice.actions;

  const {
    puTmpIncludedValue,
    puTmpExcludedValue,
    puTmpAvailableValue,
    puAction,
    puIncludedValue,
    puExcludedValue,
    puAvailableValue,
  } = useSelector((state) => state[`/scenarios/${sid}/edit`]);
  const dispatch = useDispatch();

  const scenarioPUDeletion = useDeletePUScenaro();

  const { data: PUData } = useScenarioPU(sid);

  const onClearAreas = useCallback(
    (evt: Parameters<ButtonProps['onClick']>[0]) => {
      const PUAction = evt.currentTarget.dataset['upAction'] as PUAction;

      let PUKind;

      switch (PUAction) {
        case 'include':
          PUKind = 'locked-in';
          break;
        case 'exclude':
          PUKind = 'locked-out';
          break;
        case 'available':
          PUKind = 'available';
          break;
      }

      scenarioPUDeletion.mutate(
        { sid, PUKind },
        {
          onSuccess: ({ data: { meta } }) => {
            dispatch(setJob(new Date(meta.isoDate).getTime()));

            if (PUAction === 'exclude') {
              dispatch(setTmpPuExcludedValue([]));
            }

            if (PUAction === 'include') {
              dispatch(setTmpPuIncludedValue([]));
            }

            if (PUAction === 'available') {
              dispatch(setTmpPuAvailableValue([]));
            }

            if (method === 'draw') {
              dispatch(setDrawingValue(null));
              dispatch(setDrawing('polygon'));
            }

            addToast(
              'clear-planning-units-success',
              <>
                <h2 className="font-medium">Success!</h2>
                <ul className="text-sm">
                  <li>Planning units cleared</li>
                </ul>
              </>,
              {
                level: 'success',
              }
            );
          },
          onError: () => {
            addToast(
              'clear-planning-units-error',
              <>
                <h2 className="font-medium">Error!</h2>
                <ul className="text-sm">
                  <li>Ooops! Something went wrong. Try again</li>
                </ul>
              </>,
              {
                level: 'error',
              }
            );
          },
        }
      );
    },
    [
      PUData,
      setTmpPuIncludedValue,
      setTmpPuExcludedValue,
      setTmpPuAvailableValue,
      addToast,
      scenarioPUDeletion,
      setJob,
      sid,
    ]
  );

  const onCancelPUSelection = useCallback(
    (puAction: PUAction) => {
      if (puAction === 'include') {
        dispatch(setTmpPuIncludedValue([]));
      }
      if (puAction === 'exclude') {
        dispatch(setTmpPuExcludedValue([]));
      }

      if (puAction === 'available') {
        dispatch(setTmpPuAvailableValue([]));
      }

      if (method === 'draw') {
        dispatch(setDrawing(null));
        dispatch(setDrawingValue(null));
        dispatch(setDrawing('polygon'));
      }

      if (method === 'upload') {
        dispatch(setUploading(false));
        dispatch(setUploadingValue(null));
        dispatch(setUploading(true));
      }
    },
    [
      method,
      setTmpPuIncludedValue,
      setTmpPuExcludedValue,
      setTmpPuAvailableValue,
      setDrawing,
      setDrawingValue,
      setUploading,
      setUploadingValue,
    ]
  );

  return (
    <div className="flex flex-col divide-y-2 divide-gray-500">
      {/* // ? Available areas  */}
      <div className="flex flex-col space-y-3 py-3">
        <div className="flex">
          <span className="flex flex-1 items-center space-x-2">
            <Icon
              icon={HEXAGON_SVG}
              className="fill-none h-5 w-5 stroke-current stroke-[1.5px] text-yellow-300"
            />
            <span className="text-sm text-white">Available areas</span>
          </span>
          <span
            className={cn('flex flex-1 items-center justify-center text-sm text-white', {
              'text-yellow-300': puAction === 'available',
            })}
          >
            {puTmpAvailableValue.length + puAvailableValue.length} PU
          </span>
          <div className="flex flex-1 justify-end">
            <Button
              className={cn('invisible', {
                visible: PUData.available.length > 0,
              })}
              theme="secondary"
              size="s"
              data-up-action="available"
              onClick={onClearAreas}
            >
              <div className="flex items-center space-x-2">
                <span>Clear</span>
                <Icon icon={CLOSE_SVG} className="h-2 w-2" />
              </div>
            </Button>
          </div>
        </div>
        {puAction === 'available' && (
          <ActionsSummaryButtons onCancel={() => onCancelPUSelection('available')} />
        )}
      </div>
      {/* // ? Included areas  */}
      <div className="flex flex-col space-y-3 py-3">
        <div className="flex">
          <span className="flex flex-1 items-center space-x-2">
            <Icon
              icon={HEXAGON_SVG}
              className="fill-none h-5 w-5 stroke-current stroke-[1.5px] text-green-300"
            />
            <span className="text-sm text-white">Included areas</span>
          </span>
          <span
            className={cn('flex flex-1 items-center justify-center text-sm text-white', {
              'text-green-300': puAction === 'include',
            })}
          >
            {puTmpIncludedValue.length + puIncludedValue.length} PU
          </span>
          <div className="flex flex-1 justify-end">
            <Button
              className={cn('invisible', {
                visible: PUData.included.length > 0,
              })}
              theme="secondary"
              size="s"
              data-up-action="include"
              onClick={onClearAreas}
            >
              <div className="flex items-center space-x-2">
                <span>Clear</span>
                <Icon icon={CLOSE_SVG} className="h-2 w-2" />
              </div>
            </Button>
          </div>
        </div>
        {puAction === 'include' && (
          <ActionsSummaryButtons onCancel={() => onCancelPUSelection('include')} />
        )}
      </div>
      {/* // ? Excluded areas  */}
      <div className="flex flex-col space-y-3 py-3">
        <div className="flex">
          <span className="flex flex-1 items-center space-x-2">
            <Icon
              icon={HEXAGON_SVG}
              className="fill-none h-5 w-5 stroke-current stroke-[1.5px] text-red-600"
            />
            <span className="text-sm text-white">Excluded areas</span>
          </span>
          <span
            className={cn('flex flex-1 items-center justify-center text-sm text-white', {
              'text-red-600': puAction === 'exclude',
            })}
          >
            {puTmpExcludedValue.length + puExcludedValue.length} PU
          </span>
          <div className="flex flex-1 justify-end">
            <Button
              className={cn('invisible', {
                visible: PUData.excluded.length > 0,
              })}
              theme="secondary"
              size="s"
              data-up-action="exclude"
              onClick={onClearAreas}
            >
              <div className="flex items-center space-x-2">
                <span>Clear</span>
                <Icon icon={CLOSE_SVG} className="h-2 w-2" />
              </div>
            </Button>
          </div>
        </div>
        {puAction === 'exclude' && (
          <ActionsSummaryButtons onCancel={() => onCancelPUSelection('exclude')} />
        )}
      </div>
    </div>
  );
};

export default ActionsSummary;
