import { useCallback, useMemo } from 'react';

import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useSaveSelectedFeatures, useSelectedFeatures } from 'hooks/features';

import { Button } from 'components/button/component';
import { ModalProps } from 'components/modal';
import { Feature } from 'types/api/feature';

const DeleteModal = ({
  features,
  selectedFeaturesIds,
  onDismiss,
  onDone,
}: {
  features: (Feature & { name: string })[];
  selectedFeaturesIds: Feature['id'][];
  onDismiss?: ModalProps['onDismiss'];
  onDone?: () => void;
}): JSX.Element => {
  const queryClient = useQueryClient();
  const { query } = useRouter();
  const { sid } = query as { pid: string; sid: string };
  const selectedFeaturesMutation = useSaveSelectedFeatures({});

  const selectedFeaturesQuery = useSelectedFeatures(sid);

  const selectedFeatures = useMemo(
    () => features.filter(({ id }) => selectedFeaturesIds.includes(id)) ?? [],
    [features, selectedFeaturesIds]
  );

  const featureNames = selectedFeatures.map(({ name }) => name);

  const handleBulkDelete = useCallback(() => {
    const deletableFeatureIds = selectedFeatures.map(({ id }) => id);

    selectedFeaturesMutation.mutate(
      {
        id: sid,
        data: {
          status: 'draft',
          features: selectedFeaturesQuery.data
            .filter(({ id: featureId }) => !deletableFeatureIds.includes(featureId))
            .map(
              ({
                metadata,
                id,
                name,
                description,
                amountRange,
                color,
                splitOptions,
                splitFeaturesSelected,
                splitFeaturesOptions,
                intersectFeaturesSelected,
                ...sf
              }) => ({
                ...sf,
              })
            ),
        },
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries(['selected-features', sid]);
          onDone?.();
          onDismiss();
        },
      }
    );
  }, [
    selectedFeatures,
    onDismiss,
    queryClient,
    sid,
    selectedFeaturesMutation,
    selectedFeaturesQuery.data,
  ]);

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
      <div className="flex w-full justify-between space-x-3 px-10 py-2">
        <Button theme="secondary" size="lg" className="w-full" onClick={onDismiss}>
          Cancel
        </Button>
        <Button theme="danger-alt" size="lg" className="w-full" onClick={handleBulkDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
};

export default DeleteModal;
