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
  features: any[];
  selectedFeaturesIds: Feature['id'][];
  onDismiss?: ModalProps['onDismiss'];
  onDone?: (res?: unknown) => void;
}): JSX.Element => {
  const queryClient = useQueryClient();
  const { query } = useRouter();
  const { sid } = query as { pid: string; sid: string };
  const selectedFeaturesMutation = useSaveSelectedFeatures({});

  const selectedFeaturesQuery = useSelectedFeatures(sid);

  const featuresToRemove = useMemo(
    () => features.filter(({ id }) => selectedFeaturesIds.includes(id)) ?? [],
    [features, selectedFeaturesIds]
  );

  const featureNames = featuresToRemove.map(({ name }) => name);

  const handleBulkDelete = useCallback(() => {
    const deletableFeatureIds = featuresToRemove.map(({ id }) => id);

    selectedFeaturesMutation.mutate(
      {
        id: sid,
        data: {
          status: 'draft',
          features: selectedFeaturesQuery.data
            .filter(({ id: featureId }) => {
              return !deletableFeatureIds.includes(featureId);
            })
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
                geoprocessingOperations,
                splitFeaturesOptions,
                intersectFeaturesSelected,
                splitSelected,
                ...sf
              }) => {
                if (splitSelected) {
                  const featureValues = features
                    .filter(({ id }) => deletableFeatureIds.includes(id))
                    .map(({ value }) => value);

                  return {
                    ...sf,
                    ...(geoprocessingOperations && {
                      geoprocessingOperations: geoprocessingOperations.map((go) => ({
                        ...go,
                        splits: go.splits.filter((s) => {
                          return !featureValues.includes(s.value);
                        }),
                      })),
                    }),
                  };
                }

                return {
                  ...sf,
                  geoprocessingOperations,
                };
              }
            ),
        },
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries(['selected-features', sid]);
          await queryClient.invalidateQueries(['targeted-features', sid]);
          onDone?.();
        },
      }
    );
  }, [
    queryClient,
    sid,
    selectedFeaturesMutation,
    features,
    selectedFeaturesQuery.data,
    onDone,
    featuresToRemove,
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
