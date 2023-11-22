import { ComponentProps, useCallback, useState } from 'react';

import Icon from 'components/icon';
import Modal from 'components/modal/component';
import DeleteModal from 'layout/project/sidebar/project/inventory-panel/wdpas/modals/delete';
import EditModal from 'layout/project/sidebar/project/inventory-panel/wdpas/modals/edit';
import { cn } from 'utils/cn';

import DELETE_SVG from 'svgs/ui/new-layout/delete.svg?sprite';
import TAG_SVG from 'svgs/ui/tag.svg?sprite';

import RowItem from '../../components/inventory-table/row-item';

const BUTTON_CLASSES =
  'flex items-center px-4 py-2 w-full text-sm cursor-pointer bg-gray-800 hover:bg-gray-600 transition transition-colors space-x-2 group';

const ICON_CLASSES = 'h-5 w-5 text-gray-100 group-hover:text-white';

const ActionsMenu = ({
  item,
  onDismissMenu,
}: Parameters<ComponentProps<typeof RowItem>['ActionsComponent']>[0]): JSX.Element => {
  const isDeletable = !item.isCustom && !item.scenarios;

  const [modalState, setModalState] = useState<{ edit: boolean; delete: boolean }>({
    edit: false,
    delete: false,
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

  return (
    <ul className="rounded-2xl border-gray-600">
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
          id="edit-wdpa-modal"
          title="Protected area"
          open={modalState.edit}
          size="narrow"
          onDismiss={() => handleModal('edit', false)}
        >
          <EditModal wdpaId={item.id} handleModal={handleModal} />
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
            id="delete-feature-modal"
            dismissable
            open={modalState.delete}
            size="narrow"
            onDismiss={() => {
              handleModal('delete', false);
            }}
          >
            <DeleteModal selectedWDPAIds={[item.id]} />
          </Modal>
        </li>
      )}
    </ul>
  );
};

export default ActionsMenu;
