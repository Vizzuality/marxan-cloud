import { useCallback, useState, ButtonHTMLAttributes } from 'react';

import { useQueryClient } from 'react-query';

import { FileEdit, Trash2, Tag } from 'lucide-react';

import { useDeleteProjectFeature } from 'hooks/features';
import { useToasts } from 'hooks/toast';

import ConfirmationPrompt from 'components/confirmation-prompt';
import Modal from 'components/modal/component';
import { Project, ProjectFeature } from 'types/project-model';
import { cn } from 'utils/cn';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';

import DeleteModal from '../../../modals/delete';

const BUTTON_CLASSES =
  'flex items-center px-4 py-2 w-full text-sm cursor-pointer bg-gray-700 hover:bg-gray-500 transition transition-colors space-x-2 group';

const ICON_CLASSES = 'text-gray-400 group-hover:text-white';

const FeatureActions = ({
  pid,
  feature,
  isDeletable = false,
  onEditName,
  onEditType,
}: {
  pid: Project['id'];
  feature: ProjectFeature;
  isDeletable: boolean;
  onEditName: (evt: Parameters<ButtonHTMLAttributes<HTMLButtonElement>['onClick']>[0]) => void;
  onEditType: (evt: Parameters<ButtonHTMLAttributes<HTMLButtonElement>['onClick']>[0]) => void;
}): JSX.Element => {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const { mutate: deleteProjectFeature } = useDeleteProjectFeature();
  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  const handleDelete = useCallback(() => {
    deleteProjectFeature(
      { pid, fid: feature.id },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries(['all-features', pid]);

          addToast(
            'delete-project-feature',
            <>
              <h2 className="font-medium">Success</h2>
              <p className="text-sm">The feature was deleted successfully.</p>
            </>,
            {
              level: 'success',
            }
          );
        },
        onError: () => {
          addToast(
            'delete-project-feature',
            <>
              <h2 className="font-medium">Error</h2>
              <p className="text-sm">Something went wrong deleting the feature.</p>
            </>,
            {
              level: 'error',
            }
          );
        },
      }
    );
  }, [pid, feature.id, deleteProjectFeature, addToast, queryClient]);

  const triggerDeleteModal = useCallback(() => {
    setDeleteModalOpen(true);
  }, []);

  const hideDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
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
            onClick={onEditType}
            className={cn({
              [BUTTON_CLASSES]: true,
              'rounded-b-2xl': !isDeletable,
            })}
          >
            <Tag className={ICON_CLASSES} size={20} />
            <span>Edit Type</span>
          </button>
        </li>
        {isDeletable && (
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
              open={isDeleteModalOpen}
              size="narrow"
              onDismiss={() => setDeleteModalOpen(false)}
            >
              <DeleteModal selectedFeatures={[feature]} setDeleteModal={setDeleteModalOpen} />
            </Modal>
          </li>
        )}
      </ul>
      {isDeletable && (
        <ConfirmationPrompt
          title={`Are you sure you want to remove "${feature.alias}" feature?`}
          icon={DELETE_WARNING_SVG}
          open={isDeleteModalOpen}
          onAccept={handleDelete}
          onRefuse={hideDeleteModal}
          onDismiss={hideDeleteModal}
        />
      )}
    </>
  );
};

export default FeatureActions;
