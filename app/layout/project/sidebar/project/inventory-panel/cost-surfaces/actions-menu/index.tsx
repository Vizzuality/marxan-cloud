import { useCallback, useState } from 'react';

import Icon from 'components/icon';
import Modal from 'components/modal/component';
import DeleteModal from 'layout/project/sidebar/project/inventory-panel/cost-surfaces/modals/delete';
import EditModal from 'layout/project/sidebar/project/inventory-panel/cost-surfaces/modals/edit';
import { cn } from 'utils/cn';

import DELETE_SVG from 'svgs/ui/new-layout/delete.svg?sprite';
import TAG_SVG from 'svgs/ui/tag.svg?sprite';

const BUTTON_CLASSES =
  'flex items-center px-4 py-2 w-full text-sm cursor-pointer bg-gray-700 hover:bg-gray-500 transition transition-colors space-x-2 group';

const ICON_CLASSES = 'h-5 w-5 text-gray-400 group-hover:text-white';

const ActionsMenu = ({
  item,
}: {
  item: {
    id: string;
    name: string;
    scenarios: number;
    tag: string;
    custom: boolean;
  };
}): JSX.Element => {
  const isDeletable = !item.custom && !item.scenarios;

  // item.isCustom && !item.scenarioUsageCount
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
            'last:rounded-b-2xl': !isDeletable,
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
          <EditModal costSurfaceId={item.id} handleModal={handleModal} />
        </Modal>
      </li>
      {isDeletable && (
        <li>
          <button
            type="button"
            onClick={() => {
              handleModal('delete', true);
            }}
            className={cn({
              [BUTTON_CLASSES]: true,
              'rounded-b-2xl': true,
            })}
          >
            <Icon icon={DELETE_SVG} className={ICON_CLASSES} />
            <span>Delete</span>
          </button>
          <Modal
            id="delete-cost-surface-modal"
            dismissable
            open={modalState.delete}
            size="narrow"
            onDismiss={() => {
              handleModal('delete', false);
            }}
          >
            <DeleteModal selectedCostSurfacesIds={[item.id]} />
          </Modal>
        </li>
      )}
    </ul>
  );
};

export default ActionsMenu;
