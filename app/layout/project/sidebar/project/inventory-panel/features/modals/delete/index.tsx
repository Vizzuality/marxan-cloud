import { useCallback } from 'react';

import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useSession } from 'next-auth/react';

import { useToasts } from 'hooks/toast';

import { Button } from 'components/button/component';
import Icon from 'components/icon/component';
import { deleteProjectFeatureBulk } from 'layout/project/sidebar/project/inventory-panel/features/bulk-action-menu/utils';
import { ProjectFeature } from 'types/project-model';

import ALERT_SVG from 'svgs/ui/new-layout/alert.svg?sprite';

const DeleteModal = ({
  selectedFeaturesIds,
  handleModal,
}: {
  selectedFeaturesIds: ProjectFeature['id'][];
  handleModal: (modalKey: 'delete' | 'edit', isVisible: boolean) => void;
}): JSX.Element => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { query } = useRouter();
  const { pid } = query as { pid: string };
  const { addToast } = useToasts();

  // const selectedFeaturesNames = selectedFeatures.map((f) => f.featureClassName);
  // const selectedFeatureMultiplesScenarios = selectedFeatures.some((f) => f.scenarios > 1);

  const handleBulkDelete = useCallback(async () => {
    await deleteProjectFeatureBulk(pid, selectedFeaturesIds, session)
      .then(async () => {
        await queryClient.invalidateQueries(['all-features', pid]);

        addToast(
          'delete-bulk-project-features',
          <>
            <h2 className="font-medium">Success</h2>
            <p className="text-sm">The features were deleted successfully.</p>
          </>,
          {
            level: 'success',
          }
        );
      })
      .catch(() => {
        addToast(
          'delete-bulk-project-features',
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Something went wrong deleting the features</p>
          </>,
          {
            level: 'error',
          }
        );
      });
  }, [selectedFeaturesIds, addToast, pid, queryClient, session]);

  return (
    <div className="flex flex-col space-y-5 px-8 py-1">
      <h2 className="font-heading font-bold text-black">Delete feauture</h2>
      <p className="font-heading text-sm font-medium text-black">
        {/* Are you sure you want to delete &quot;{selectedFeaturesNames}&quot;? You can’t undo this
        action. */}
        Are you sure you want to delete &quot;{selectedFeaturesIds}&quot;? You can’t undo this
        action.
      </p>
      <div className="flex items-center space-x-1.5 rounded border-l-[5px] border-red-600 bg-red-50/50 px-1.5 py-4">
        <Icon className="h-10 w-10 text-red-600" icon={ALERT_SVG} />
        <p className="font-sans text-xs font-medium text-black">
          A feature can be deleted ONLY if it&apos;s not being used by any scenario
        </p>
      </div>
      <div className="flex w-full justify-between space-x-3 px-10 py-2">
        <Button
          theme="secondary"
          size="lg"
          className="w-full"
          onClick={() => handleModal('delete', false)}
        >
          Cancel
        </Button>
        <Button
          theme="danger-alt"
          size="lg"
          className="w-full"
          // disabled={selectedFeaturesMultipleScenarios}
          onClick={handleBulkDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default DeleteModal;
