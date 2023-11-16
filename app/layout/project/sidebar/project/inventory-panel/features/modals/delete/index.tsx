import { useCallback, useMemo } from 'react';

import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useSession } from 'next-auth/react';

import { useToasts } from 'hooks/toast';

import { Button } from 'components/button/component';
import Icon from 'components/icon/component';
import { ModalProps } from 'components/modal';
import { bulkDeleteFeatureFromProject } from 'layout/project/sidebar/project/inventory-panel/features/bulk-action-menu/utils';
import { Feature } from 'types/api/feature';
import { Pagination } from 'types/api/meta';

import ALERT_SVG from 'svgs/ui/new-layout/alert.svg?sprite';

const DeleteModal = ({
  selectedFeaturesIds,
  onDismiss,
}: {
  selectedFeaturesIds: Feature['id'][];
  onDismiss?: ModalProps['onDismiss'];
}): JSX.Element => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { query } = useRouter();
  const { pid } = query as { pid: string };
  const { addToast } = useToasts();

  const selectedFeatures = useMemo(
    () =>
      queryClient
        .getQueryData<{ data: Feature[]; meta: Pagination }>(['all-features', pid], {
          exact: false,
        })
        ?.data?.filter(({ id, isCustom }) => selectedFeaturesIds.includes(id) && isCustom) ?? [],
    [queryClient, selectedFeaturesIds, pid]
  );

  const featureNames = selectedFeatures.map(({ featureClassName }) => featureClassName);
  // ? the user will be able to delete the features only if they are not being used by any scenario.
  const haveScenarioAssociated = selectedFeatures.some(({ scenarioUsageCount }) =>
    Boolean(scenarioUsageCount)
  );

  const handleBulkDelete = useCallback(() => {
    const deletableFeatureIds = selectedFeatures.map(({ id }) => id);

    bulkDeleteFeatureFromProject(pid, deletableFeatureIds, session)
      .then(async () => {
        await queryClient.invalidateQueries(['all-features', pid]);
        await queryClient.invalidateQueries(['project-tags', pid]);

        onDismiss();

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
  }, [selectedFeatures, addToast, onDismiss, pid, queryClient, session]);

  return (
    <div className="flex flex-col space-y-5 px-8 py-1">
      <h2 className="font-heading font-bold text-black">{`Delete feature${
        selectedFeaturesIds.length > 1 ? 's' : ''
      }`}</h2>
      <p className="font-heading text-sm font-medium text-black">
        {selectedFeaturesIds.length > 1 ? (
          <div className="space-y-2">
            <span>
              Are you sure you want to delete the following features? <br />
              This action cannot be undone.
            </span>
            <ul>
              {featureNames.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        ) : (
          <span>
            Are you sure you want to delete &quot;{featureNames[0]}&quot; feature? <br />
            This action cannot be undone.
          </span>
        )}
      </p>
      <div className="flex items-center space-x-1.5 rounded border-l-[5px] border-red-700 bg-red-100/50 px-1.5 py-4">
        <Icon className="h-10 w-10 text-red-700" icon={ALERT_SVG} />
        <p className="font-sans text-xs font-medium text-black">
          A feature can be deleted ONLY if it&apos;s not being used by any scenario
        </p>
      </div>
      <div className="flex w-full justify-between space-x-3 px-10 py-2">
        <Button theme="secondary" size="lg" className="w-full" onClick={onDismiss}>
          Cancel
        </Button>
        <Button
          theme="danger-alt"
          size="lg"
          className="w-full"
          disabled={haveScenarioAssociated}
          onClick={handleBulkDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default DeleteModal;
