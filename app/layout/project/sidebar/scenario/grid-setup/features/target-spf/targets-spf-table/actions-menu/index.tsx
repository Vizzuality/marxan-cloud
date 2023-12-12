import { ComponentProps, useCallback, useState } from 'react';

import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import Icon from 'components/icon';
import Modal from 'components/modal/component';
import EditModal from 'layout/project/sidebar/project/inventory-panel/features/modals/edit';
import SplitModal from 'layout/project/sidebar/scenario/grid-setup/features/modals/split';
import { cn } from 'utils/cn';

import DELETE_SVG from 'svgs/ui/new-layout/delete.svg?sprite';
import SPLIT_SVG from 'svgs/ui/split.svg?sprite';
import TAG_SVG from 'svgs/ui/tag.svg?sprite';

import RowItem from '../row-item';

const BUTTON_CLASSES =
  'enabled:group flex w-full cursor-pointer items-center space-x-2 bg-gray-800 px-4 py-2 text-sm transition-colors enabled:hover:bg-gray-700';

const BUTTON_DISABLED_CLASSES = 'disabled:cursor-default disabled:text-gray-600';

const ICON_CLASSES = 'h-5 w-5 text-gray-100 group-hover:text-white';

const ICON_DISABLED_CLASSES = 'text-gray-700';

const ActionsMenu = ({
  item,
  onDeleteFeature,
  onDismissMenu,
}: Parameters<ComponentProps<typeof RowItem>['ActionsComponent']>[0]): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };
  const queryClient = useQueryClient();
  const isDeletable = item.isCustom;
  const isSplittable = Boolean(item.splitOptions?.length);

  const [modalState, setModalState] = useState<{ edit: boolean; split: boolean }>({
    edit: false,
    split: false,
  });

  const handleModal = useCallback(
    (modalKey: keyof typeof modalState, isVisible: boolean) => {
      setModalState((prevState) => {
        if (!isVisible) onDismissMenu();
        return { ...prevState, [modalKey]: isVisible };
      });
    },
    [onDismissMenu]
  );

  const onDoneEditing = useCallback(async () => {
    await queryClient.invalidateQueries(['selected-features', sid]);
  }, [queryClient, sid]);

  return (
    <ul className="rounded-2xl border-gray-600">
      <li>
        <button
          type="button"
          onClick={() => {
            handleModal('edit', true);
          }}
          className={cn({
            [BUTTON_CLASSES]: true,
            'rounded-t-2xl': true,
          })}
        >
          <Icon icon={TAG_SVG} className={ICON_CLASSES} />
          <span>Edit</span>
        </button>
        <Modal
          id="edit-feature-modal"
          title="All features"
          open={modalState.edit}
          size="narrow"
          onDismiss={() => {
            handleModal('edit', false);
          }}
        >
          <EditModal featureId={item.id} handleModal={handleModal} onDone={onDoneEditing} />
        </Modal>
      </li>
      {isSplittable && (
        <li>
          <button
            type="button"
            onClick={() => {
              handleModal('split', true);
            }}
            className={cn({
              [BUTTON_CLASSES]: true,
              [BUTTON_DISABLED_CLASSES]: !isDeletable,
            })}
            disabled={!isDeletable}
          >
            <Icon
              icon={SPLIT_SVG}
              className={cn({
                [ICON_CLASSES]: true,
                [ICON_DISABLED_CLASSES]: !isDeletable,
              })}
            />
            <span>Split</span>
          </button>
          <Modal
            id="split-feature-modal"
            title="All features"
            open={modalState.split}
            size="narrow"
            onDismiss={() => {
              handleModal('split', false);
            }}
          >
            <SplitModal featureId={item.id} handleModal={handleModal} />
          </Modal>
        </li>
      )}
      <li>
        <button
          type="button"
          onClick={() => {
            onDeleteFeature(item.id);
          }}
          className={cn({
            [BUTTON_CLASSES]: true,
            'rounded-b-2xl': true,
            [BUTTON_DISABLED_CLASSES]: !isDeletable,
          })}
          disabled={!isDeletable}
        >
          <Icon
            icon={DELETE_SVG}
            className={cn({
              [ICON_CLASSES]: true,
              [ICON_DISABLED_CLASSES]: !isDeletable,
            })}
          />
          <span>Delete</span>
        </button>
      </li>
    </ul>
  );
};

export default ActionsMenu;
