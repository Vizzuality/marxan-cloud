import { useCallback, useState, ButtonHTMLAttributes } from 'react';

import { FileEdit, Trash2, Tag } from 'lucide-react';

import Modal from 'components/modal/component';
import DeleteModal from 'layout/project/sidebar/project/inventory-panel/features/modals/delete';
import EditTypeModal from 'layout/project/sidebar/project/inventory-panel/features/modals/edit-type';
import { Project, ProjectFeature } from 'types/project-model';
import { cn } from 'utils/cn';

const BUTTON_CLASSES =
  'flex items-center px-4 py-2 w-full text-sm cursor-pointer bg-gray-700 hover:bg-gray-500 transition transition-colors space-x-2 group';

const ICON_CLASSES = 'text-gray-400 group-hover:text-white';

const FeatureActions = ({
  pid,
  feature,
  onEditName,
  onEditType,
}: {
  pid: Project['id'];
  feature: ProjectFeature;
  onEditName: (evt: Parameters<ButtonHTMLAttributes<HTMLButtonElement>['onClick']>[0]) => void;
  onEditType: (evt: Parameters<ButtonHTMLAttributes<HTMLButtonElement>['onClick']>[0]) => void;
}): JSX.Element => {
  const [modalState, setModalState] = useState<{ edit: boolean; delete: boolean }>({
    edit: false,
    delete: false,
  });

  const handleModal = useCallback((modalKey: keyof typeof modalState, isVisible: boolean) => {
    setModalState((prevState) => ({ ...prevState, [modalKey]: isVisible }));
  }, []);

  const triggerDeleteModal = useCallback(() => {
    handleModal('delete', true);
  }, []);

  return (
    <>
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
            className={BUTTON_CLASSES}
          >
            <Tag className={ICON_CLASSES} size={20} />
            <span>Edit Type</span>
          </button>
          <Modal
            id="edit-feaure-modal"
            title="All features"
            open={modalState.edit}
            size="narrow"
            onDismiss={() => handleModal('edit', false)}
          >
            <EditTypeModal feature={feature} handleModal={handleModal} />
          </Modal>
        </li>
        {feature.scenarioUsageCount === 1 && (
          <li>
            <button
              type="button"
              onClick={triggerDeleteModal}
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
              onDismiss={() => handleModal('delete', false)}
            >
              <DeleteModal selectedFeaturesIds={[feature.id]} />
            </Modal>
          </li>
        )}
      </ul>
    </>
  );
};

export default FeatureActions;
