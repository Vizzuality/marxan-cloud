import { useCallback, useState, ChangeEvent, useRef, InputHTMLAttributes } from 'react';

import { useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';

import { setSelectedFeatures as setVisibleFeatures } from 'store/slices/projects/[id]';

import { MoreHorizontal } from 'lucide-react';

import { useEditFeature } from 'hooks/features';
import { useToasts } from 'hooks/toast';

import Checkbox from 'components/forms/checkbox';
import Icon from 'components/icon';
import { Popover, PopoverContent, PopoverTrigger } from 'components/popover';
import FeatureActions from 'layout/project/sidebar/project/inventory-panel/protected-areas/list/item/actions';
import { Feature } from 'types/feature';
import { Project } from 'types/project-model';
import { cn } from 'utils/cn';

import HIDE_SVG from 'svgs/ui/hide.svg?sprite';
import SHOW_SVG from 'svgs/ui/show.svg?sprite';

const ProtectedAreaItemList = ({
  feature,
  projectId,
  isSelected,
  onSelectFeature,
}: {
  feature: Feature;
  projectId: Project['id'];
  isSelected: boolean;
  onSelectFeature: (evt: ChangeEvent<HTMLInputElement>) => void;
}): JSX.Element => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const { selectedFeatures: visibleFeatures } = useSelector((state) => state['/projects/[id]']);
  const [isEditable, setEditable] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { mutate: editFeature } = useEditFeature();

  const handleRename = useCallback(() => {
    setEditable(true);
    nameInputRef.current?.focus();
  }, [nameInputRef]);

  const handleNameChanges = useCallback(
    (evt: Parameters<InputHTMLAttributes<HTMLInputElement>['onKeyDown']>[0]) => {
      if (evt.key === 'Enter') {
        setEditable(false);
        nameInputRef.current?.blur();

        editFeature(
          {
            fid: feature.id,
            body: {
              featureClassName: evt.currentTarget.value,
            },
          },
          {
            onSuccess: async () => {
              await queryClient.invalidateQueries(['all-features', projectId]);

              addToast(
                'edit-project-features',
                <>
                  <h2 className="font-medium">Success</h2>
                  <p className="text-sm">The feature was updated successfully.</p>
                </>,
                {
                  level: 'success',
                }
              );
            },
            onError: () => {
              addToast(
                'edit-project-features',
                <>
                  <h2 className="font-medium">Error</h2>
                  <p className="text-sm">Something went wrong editing the feature.</p>
                </>,
                {
                  level: 'error',
                }
              );
            },
          }
        );
      }
    },
    [nameInputRef, projectId, feature.id, editFeature, addToast, queryClient]
  );

  const toggleSeeOnMap = useCallback(
    (featureId: Feature['id']) => {
      const newSelectedFeatures = [...visibleFeatures];

      if (!newSelectedFeatures.includes(featureId)) {
        newSelectedFeatures.push(featureId);
      } else {
        const i = newSelectedFeatures.indexOf(featureId);
        newSelectedFeatures.splice(i, 1);
      }
      dispatch(setVisibleFeatures(newSelectedFeatures));
    },
    [dispatch, visibleFeatures]
  );

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex w-3/5 space-x-2">
        <Checkbox
          id={`item-${feature.id}`}
          theme="light"
          className="block h-4 w-4 checked:bg-blue-400"
          onChange={onSelectFeature}
          checked={isSelected}
          value={feature.id}
        />

        <input
          ref={nameInputRef}
          defaultValue={feature.featureClassName}
          readOnly={!isEditable}
          className={cn({
            'w-full text-ellipsis bg-transparent p-0 text-sm leading-none': true,
            'border-transparent': isEditable,
          })}
          onKeyDown={handleNameChanges}
        />
      </div>

      <div className="flex space-x-3">
        <button type="button" onClick={() => toggleSeeOnMap(feature.id)}>
          <Icon className="h-4 w-4" icon={true ? SHOW_SVG : HIDE_SVG} />
        </button>
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="rounded-full bg-black">
              <MoreHorizontal className="text-white" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto rounded-2xl border-transparent p-0"
            side="bottom"
            sideOffset={5}
            align="start"
          >
            <FeatureActions
              feature={feature}
              onEditName={handleRename}
              isDeletable={feature.isCustom && !feature.scenarioUsageCount}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ProtectedAreaItemList;
