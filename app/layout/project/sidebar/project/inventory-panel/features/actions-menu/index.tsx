import { useCallback, useState } from 'react';

import Icon from 'components/icon';
import Modal from 'components/modal/component';
import { type DataItem } from 'layout/project/sidebar/project/inventory-panel/components/inventory-table';
import DeleteModal from 'layout/project/sidebar/project/inventory-panel/features/modals/delete';
import EditModal from 'layout/project/sidebar/project/inventory-panel/features/modals/edit';
import { cn } from 'utils/cn';

import DELETE_SVG from 'svgs/ui/new-layout/delete.svg?sprite';
import TAG_SVG from 'svgs/ui/tag.svg?sprite';

const BUTTON_CLASSES =
  'enabled:group flex w-full cursor-pointer items-center space-x-2 bg-gray-700 px-4 py-2 text-sm transition-colors enabled:hover:bg-gray-500';

const BUTTON_DISABLED_CLASSES = 'disabled:cursor-default disabled:text-gray-400';

const ICON_CLASSES = 'h-5 w-5 text-gray-400 group-hover:text-white';

const ICON_DISABLED_CLASSES = 'text-gray-500';

const ActionsMenu = ({ item }: { item: DataItem }): JSX.Element => {
  const isDeletable = !item.isCustom || !item.scenarios;

  const [modalState, setModalState] = useState<{ edit: boolean; delete: boolean }>({
    edit: false,
    delete: false,
  });

  const handleModal = useCallback((modalKey: keyof typeof modalState, isVisible: boolean) => {
    setModalState((prevState) => ({ ...prevState, [modalKey]: isVisible }));
  }, []);

  return (
    <ul className="rounded-2xl border-gray-500">
      <li>
        <button
          type="button"
          onClick={() => handleModal('edit', true)}
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
          onDismiss={() => handleModal('edit', false)}
        >
          <EditModal featureId={item.id} handleModal={handleModal} />
        </Modal>
      </li>
      <li>
        <button
          type="button"
          onClick={() => {
            handleModal('delete', true);
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
        <Modal
          id="delete-feature-modal"
          dismissable
          open={modalState.delete}
          size="narrow"
          onDismiss={() => {
            handleModal('delete', false);
          }}
        >
          <DeleteModal selectedFeaturesIds={[item.id]} />
        </Modal>
      </li>
    </ul>
  );
};

export default ActionsMenu;
