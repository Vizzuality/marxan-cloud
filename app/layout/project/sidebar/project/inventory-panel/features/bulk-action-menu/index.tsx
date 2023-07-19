import { useCallback } from 'react';

import { useQueryClient } from 'react-query';

import { useSession } from 'next-auth/react';

import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import { Project, ProjectFeature } from 'types/project-model';

import { deleteProjectFeatureBulk } from './utils';

const FeaturesBulkActionMenu = ({
  pid,
  selectedFeatureIds,
}: {
  pid: Project['id'];
  selectedFeatureIds: ProjectFeature['id'][];
}): JSX.Element => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  const handleBulkDelete = useCallback(async () => {
    await deleteProjectFeatureBulk(pid, selectedFeatureIds, session)
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
  }, [selectedFeatureIds, addToast, pid, queryClient, session]);

  return (
    <div className="absolute bottom-0 left-0 z-10 flex w-full items-center space-x-4 bg-black px-8 py-4">
      <Button theme="secondary-alt" size="lg">
        Edit
      </Button>
      <Button theme="secondary" size="lg" onClick={handleBulkDelete}>
        Delete
      </Button>
    </div>
  );
};

export default FeaturesBulkActionMenu;
