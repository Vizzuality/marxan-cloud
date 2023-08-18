import { useCallback, useState, ButtonHTMLAttributes } from 'react';

import { FileEdit, Trash2, Tag } from 'lucide-react';

import Modal from 'components/modal/component';
import DeleteModal from 'layout/project/sidebar/project/inventory-panel/features/modals/delete';
import EditModal from 'layout/project/sidebar/project/inventory-panel/features/modals/edit';
import { Feature } from 'types/api/feature';
import { cn } from 'utils/cn';

const BUTTON_CLASSES =
  'flex items-center px-4 py-2 w-full text-sm cursor-pointer bg-gray-700 hover:bg-gray-500 transition transition-colors space-x-2 group';

const ICON_CLASSES = 'text-gray-400 group-hover:text-white';

const FeatureActions = ({
  feature,
  onEditName,
  isDeletable,
}: {
  feature: Feature;
  isDeletable: boolean;
  onEditName: (evt: Parameters<ButtonHTMLAttributes<HTMLButtonElement>['onClick']>[0]) => void;
}): JSX.Element => {
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
          onClick={onEditName}
          className={cn({
            [BUTTON_CLASSES]: true,
            'rounded-t-2xl': true,
          })}
        >
          <FileEdit className={ICON_CLASSES} size={20} />
          <span>Rename</span>
        </button>
      </li>
      <li>
        <button
          type="button"
          onClick={() => handleModal('edit', true)}
          className={cn({
            [BUTTON_CLASSES]: true,
            'last:rounded-b-2xl': !isDeletable,
          })}
        >
          <Tag className={ICON_CLASSES} size={20} />
          <span>Edit</span>
        </button>
        <Modal
          id="edit-feaure-modal"
          title="All features"
          open={modalState.edit}
          size="narrow"
          onDismiss={() => handleModal('edit', false)}
        >
          <EditModal featureId={feature.id} handleModal={handleModal} />
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
            <Trash2 className={ICON_CLASSES} size={20} />
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
            <DeleteModal selectedFeaturesIds={[feature.id]} />
          </Modal>
        </li>
      )}
    </ul>
  );
};

export default FeatureActions;
