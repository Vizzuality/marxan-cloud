import { useCallback, useState } from 'react';

import Button from 'components/button';
import Icon from 'components/icon';
import Modal from 'components/modal/component';
import DeleteModal from 'layout/project/sidebar/project/inventory-panel/protected-areas/modals/delete';
import { WDPA } from 'types/api/wdpa';

import DELETE_SVG from 'svgs/ui/new-layout/delete.svg?sprite';

const BUTTON_CLASSES =
  'col-span-1 flex items-center space-x-2 rounded-lg bg-gray-700 px-4 text-xs text-gray-50';
const ICON_CLASSES = 'h-5 w-5 transition-colors text-gray-400 group-hover:text-gray-50';

const WDPABulkActionMenu = ({
  selectedWDPAIds,
}: {
  selectedWDPAIds: WDPA['id'][];
}): JSX.Element => {
  const [modalState, setModalState] = useState<{ edit: boolean; delete: boolean }>({
    edit: false,
    delete: false,
  });

  const handleModal = useCallback((modalKey: keyof typeof modalState, isVisible: boolean) => {
    setModalState((prevState) => ({ ...prevState, [modalKey]: isVisible }));
  }, []);

  return (
    <>
      <div className="grid w-full grid-cols-2 items-center space-x-2 rounded-xl bg-gray-500 p-1">
        <span className="col-span-1 flex items-center justify-center space-x-2">
          <span className="block w-[20px] rounded-[4px] bg-blue-400/25 px-1 text-center text-xs font-semibold text-blue-400">
            {selectedWDPAIds.length}
          </span>
          <span className="text-xs text-gray-50">Selected</span>
        </span>

        <Button
          theme="secondary"
          size="base"
          className={BUTTON_CLASSES}
          onClick={() => handleModal('delete', true)}
        >
          <Icon icon={DELETE_SVG} className={ICON_CLASSES} />
          <span>Delete</span>
        </Button>
      </div>

      <Modal
        id="delete-features-modal"
        open={modalState.delete}
        size="narrow"
        dismissable
        onDismiss={() => handleModal('delete', false)}
      >
        <DeleteModal selectedWDPAIds={selectedWDPAIds} />
      </Modal>
    </>
  );
};

export default WDPABulkActionMenu;
