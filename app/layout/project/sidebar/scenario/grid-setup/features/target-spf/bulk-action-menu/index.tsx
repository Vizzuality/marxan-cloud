import { useCallback, useState } from 'react';

import { useRouter } from 'next/router';

import { useCanEditScenario } from 'hooks/permissions';

import Button from 'components/button';
import Icon from 'components/icon';
import Modal from 'components/modal/component';
import { Feature } from 'types/api/feature';

import EDIT_SVG from 'svgs/ui/edit.svg?sprite';
import DELETE_SVG from 'svgs/ui/new-layout/delete.svg?sprite';

import DeleteModal from './modals/delete';
import EditModal from './modals/edit';

const BUTTON_CLASSES =
  'col-span-1 flex items-center space-x-2 rounded-lg bg-gray-800 px-4 text-xs text-gray-100';
const ICON_CLASSES = 'h-5 w-5 transition-colors text-gray-100 group-hover:text-gray-100';

const SplitFeaturesBulkActionMenu = ({
  features,
  selectedFeatureIds,
  onDone,
}: {
  features: (Feature & { name: string; marxanSettings: { prop?: number; fpf?: number } })[];
  selectedFeatureIds: Feature['id'][];
  onDone: (res?: unknown) => void;
}): JSX.Element => {
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };
  const editable = useCanEditScenario(pid, sid);
  const [modalState, setModalState] = useState<{ edit: boolean; delete: boolean }>({
    edit: false,
    delete: false,
  });

  const handleModal = useCallback((modalKey: keyof typeof modalState, isVisible: boolean) => {
    setModalState((prevState) => ({ ...prevState, [modalKey]: isVisible }));
  }, []);

  return (
    <>
      <div className="grid w-full grid-cols-3 items-center space-x-2 rounded-xl bg-gray-600 p-1">
        <span className="col-span-1 flex items-center justify-center space-x-2">
          <span className="block w-[20px] rounded-[4px] bg-blue-500/25 px-1 text-center text-xs font-semibold text-blue-500">
            {selectedFeatureIds.length}
          </span>
          <span className="text-xs text-gray-100">Selected</span>
        </span>

        <Button
          theme="secondary"
          size="base"
          className={BUTTON_CLASSES}
          onClick={() => handleModal('edit', true)}
        >
          <Icon icon={EDIT_SVG} className={ICON_CLASSES} />
          <span>Edit</span>
        </Button>

        <Button
          theme="secondary"
          size="base"
          className={BUTTON_CLASSES}
          onClick={() => handleModal('delete', true)}
          disabled={!editable}
        >
          <Icon icon={DELETE_SVG} className={ICON_CLASSES} />
          <span>Delete</span>
        </Button>
      </div>

      <Modal
        id="delete-split-features-modal"
        open={modalState.delete}
        size="narrow"
        dismissable
        onDismiss={() => {
          handleModal('delete', false);
        }}
      >
        <DeleteModal features={features} onDone={onDone} selectedFeaturesIds={selectedFeatureIds} />
      </Modal>

      <Modal
        id="edit-split-features-modal"
        open={modalState.edit}
        size="narrow"
        dismissable
        onDismiss={() => {
          handleModal('edit', false);
        }}
      >
        <EditModal
          selectedFeatures={features.filter((feature) => selectedFeatureIds.includes(feature.id))}
          onDone={onDone}
          handleModal={() => {
            handleModal('edit', false);
          }}
        />
      </Modal>
    </>
  );
};

export default SplitFeaturesBulkActionMenu;
