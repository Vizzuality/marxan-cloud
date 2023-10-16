import { useMemo } from 'react';

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  QueryObserverOptions,
} from 'react-query';

import { AxiosRequestConfig } from 'axios';
import chroma from 'chroma-js';
import Fuse from 'fuse.js';
import flatten from 'lodash/flatten';
import orderBy from 'lodash/orderBy';
import partition from 'lodash/partition';
import { useSession } from 'next-auth/react';

import { COLORS } from 'hooks/map/constants';

import { ItemProps as IntersectItemProps } from 'components/features/intersect-item/component';
import { ItemProps as RawItemProps } from 'components/features/raw-item/component';
import { Feature } from 'types/api/feature';
import { GeoFeatureSet } from 'types/api/geo-feature-set';
import { Project } from 'types/api/project';
import { Scenario } from 'types/api/scenario';

import GEOFEATURES from 'services/geo-features';
import PROJECTS from 'services/projects';
import SCENARIOS from 'services/scenarios';
import UPLOADS from 'services/uploads';

import {
  UseFeaturesFiltersProps,
  UseFeaturesOptionsProps,
  UseSaveSelectedFeaturesProps,
  SaveSelectedFeaturesProps,
} from './types';

interface AllItemProps extends IntersectItemProps, RawItemProps {}

export function useAllPaginatedFeatures(projectId, options: UseFeaturesOptionsProps = {}) {
  const { data: session } = useSession();

  const { filters = {}, search, sort } = options;

  const parsedFilters = Object.keys(filters).reduce((acc, k) => {
    return {
      ...acc,
      [`filter[${k}]`]: filters[k].toString(),
    };
  }, {});

  const fetchFeatures = ({ pageParam = 1 }) =>
    PROJECTS.request({
      method: 'GET',
      url: `/${projectId}/features`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      params: {
        'page[number]': pageParam,
        // omitFields: 'properties',
        ...parsedFilters,
        ...(search && {
          q: search,
        }),
        ...(sort && {
          sort,
        }),
      },
    });

  const query = useInfiniteQuery(
    ['all-paginated-features', projectId, JSON.stringify(options)],
    fetchFeatures,
    {
      keepPreviousData: true,
      getNextPageParam: (lastPage) => {
        const {
          data: { meta },
        } = lastPage;
        const { page, totalPages } = meta;

        const nextPage = page + 1 > totalPages ? null : page + 1;
        return nextPage;
      },
    }
  );

  const { data } = query;
  const { pages } = data || {};

  return useMemo(() => {
    const parsedData = Array.isArray(pages)
      ? flatten(
          pages.map((p) => {
            const {
              data: { data: pageData },
            } = p;

            return pageData.map((d): AllItemProps => {
              const {
                id,
                alias,
                featureClassName,
                description,
                properties = {},
                splitSelected,
                splitFeaturesSelected,
              } = d;

              let splitOptions = [];
              let splitFeaturesOptions = [];

              /**
               * @todo Checking whether `properties` is defined here is just a
               * workaround to avoid an error when processing `bioregional`
               * features, which would prevent progressing through the stop of
               * configuring features for a scenario until this code is reviewed.
               * Without much knowledge of the flow for feature data, I see that
               * short-circuiting the `map()` below and therefore setting
               * `splitOptions = []` still results in properties being shown in the
               * dropdowns used for splitting features, but since `properties` is
               * always undefined (from what I can see), we may need to adapt the
               * API payload or how we process it here.
               */
              splitOptions = properties
                ? Object.keys(properties).map((k) => {
                    return {
                      key: k,
                      label: k,
                      values: properties[k].map((v) => ({ id: v, name: v })),
                    };
                  })
                : [];

              splitFeaturesOptions = splitSelected
                ? splitOptions
                    .find((s) => s.key === splitSelected)
                    .values.map((v) => ({ label: v.name, value: v.id }))
                : [];

              return {
                id,
                name: alias || featureClassName,
                description,

                splitSelected,
                splitOptions,
                splitFeaturesSelected,
                splitFeaturesOptions,
              };
            });
          })
        )
      : [];

    // We want to return custom features first, but preserve the overall sorting
    const sortedByCustomFeature = flatten(partition(parsedData, (feature) => feature.isCustom));

    return {
      ...query,
      data: sortedByCustomFeature,
    };
  }, [query, pages]);
}

export function useAllFeatures<T = { data: Feature[] }>(
  projectId: Project['id'],
  options: UseFeaturesOptionsProps = {},
  queryOptions: QueryObserverOptions<{ data: Feature[] }, Error, T> = {}
) {
  const { data: session } = useSession();

  const { filters = {}, search, sort } = options;

  const parsedFilters = Object.keys(filters).reduce((acc, k) => {
    return {
      ...acc,
      [`filter[${k}]`]: filters[k].toString(),
    };
  }, {});

  const fetchFeatures = () =>
    PROJECTS.request<{ data: Feature[] }>({
      method: 'GET',
      url: `/${projectId}/features`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      params: {
        ...parsedFilters,
        ...(search && {
          q: search,
        }),
        ...(sort && {
          sort,
        }),
      },
    }).then(({ data }) => data);

  return useQuery({
    queryKey: ['all-features', projectId, JSON.stringify(options)],
    queryFn: fetchFeatures,
    ...queryOptions,
  });
}

export function useSelectedFeatures(
  sid: Scenario['id'],
  filters: UseFeaturesFiltersProps = {},
  queryOptions = {}
) {
  const { data: session } = useSession();
  const { search } = filters;

  const fetchFeatures = () =>
    SCENARIOS.request({
      method: 'GET',
      url: `/${sid}/features/specification`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }).then(({ data }) => data);

  return useQuery(['selected-features', sid], fetchFeatures, {
    ...queryOptions,
    enabled: !!sid,
    select: ({ data }) => {
      const { features = [] } = data;

      let parsedData = features.map((d, index) => {
        const { featureId, geoprocessingOperations, metadata } = d;

        const {
          alias,
          featureClassName,
          tag,
          description,
          properties = {},
        } = metadata || ({} as GeoFeatureSet['features'][0]['metadata']);

        let splitOptions = [];
        let splitFeaturesOptions = [];
        let splitSelected;
        let splitFeaturesSelected = [];

        splitOptions = Object.keys(properties).map((k) => {
          return {
            key: k,
            label: k,
            values: properties[k].map((v) => ({ id: v, name: v })),
          };
        });

        if (
          geoprocessingOperations &&
          !!geoprocessingOperations.find((g) => g.kind === 'split/v1')
        ) {
          const geoprocessingOperation = geoprocessingOperations.find((g) => g.kind === 'split/v1');
          splitSelected = geoprocessingOperation.splitByProperty;

          splitFeaturesOptions =
            splitOptions.length && splitSelected
              ? splitOptions
                  .find((s) => s.key === splitSelected)
                  .values.map((v) => ({ label: v.name, value: `${v.id}` }))
              : [];

          splitFeaturesSelected = geoprocessingOperation.splits.map((s) => {
            return {
              ...s,
              id: `${s.value}`,
              name: s.value,
            };
          });
        }

        let intersectFeaturesSelected = [];

        if (
          geoprocessingOperations &&
          geoprocessingOperations.find((g) => g.kind === 'stratification/v1')
        ) {
          intersectFeaturesSelected = flatten(
            geoprocessingOperations.map((ifs) => {
              return ifs.splits.map((v) => {
                return {
                  ...v,
                  label: v.value,
                  value: v.value,
                };
              });
            })
          );
        }

        const color =
          features.length > COLORS.features.ramp.length
            ? chroma.scale(COLORS.features.ramp).colors(features.length)[index]
            : COLORS.features.ramp[index];

        return {
          ...d,
          id: featureId,
          name: alias || featureClassName,
          type: tag,
          description,
          color,

          // SPLIT
          splitOptions,
          splitSelected,
          splitFeaturesSelected,
          splitFeaturesOptions,

          // INTERSECTION
          intersectFeaturesSelected,
        };
      });

      // Filter
      if (search) {
        const fuse = new Fuse(parsedData, {
          keys: ['name'],
          threshold: 0.25,
        });
        parsedData = fuse.search(search).map((f) => {
          return f.item;
        });
      }

      // Sort
      parsedData = orderBy(parsedData, ['type', 'name'], ['asc', 'asc']);

      return parsedData;
    },
    placeholderData: { data: {} as GeoFeatureSet },
  });
}

export function useTargetedFeatures(
  sid: Scenario['id'],
  filters: UseFeaturesFiltersProps = {},
  queryOptions = {}
) {
  const { data: session } = useSession();
  const { search } = filters;

  const fetchFeatures = () =>
    SCENARIOS.request({
      method: 'GET',
      url: `/${sid}/features/specification`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }).then(({ data }) => data);

  return useQuery(['targeted-features', sid], fetchFeatures, {
    ...queryOptions,
    retry: false,
    enabled: !!sid,
    select: ({ data }) => {
      const { features = [] } = data;

      let parsedData = features.map((d) => {
        const { featureId, geoprocessingOperations, metadata } = d;

        const {
          alias,
          featureClassName,
          tag,
          description,
          properties = {},
        } = metadata || ({} as GeoFeatureSet['features'][0]['metadata']);

        let splitOptions = [];
        let splitFeaturesOptions = [];
        let splitSelected;
        let splitFeaturesSelected = [];

        splitOptions = Object.keys(properties).map((k) => {
          return {
            key: k,
            label: k,
            values: properties[k].map((v) => ({ id: v, name: v })),
          };
        });

        if (geoprocessingOperations && geoprocessingOperations.find((g) => g.kind === 'split/v1')) {
          const geoprocessingOperation = geoprocessingOperations.find((g) => g.kind === 'split/v1');

          splitSelected = geoprocessingOperation.splitByProperty;

          splitFeaturesOptions =
            splitOptions.length && splitSelected
              ? splitOptions
                  .find((s) => s.key === splitSelected)
                  .values.map((v) => ({ label: v.name, value: v.id }))
              : [];

          splitFeaturesSelected = geoprocessingOperation.splits.map((s) => {
            return {
              ...s,
              id: s.value,
              name: s.value,
            };
          });
        }

        let intersectFeaturesSelected = [];

        if (
          geoprocessingOperations &&
          geoprocessingOperations.find((g) => g.kind === 'stratification/v1')
        ) {
          intersectFeaturesSelected = flatten(
            geoprocessingOperations.map((ifs) => {
              return ifs.splits.map((v) => {
                return {
                  ...v,
                  label: v.value,
                  value: v.value,
                };
              });
            })
          );
        }

        return {
          ...d,
          id: featureId,
          name: alias || featureClassName,
          type: tag,
          description,

          // SPLIT
          splitOptions,
          splitSelected,
          splitFeaturesSelected,
          splitFeaturesOptions,

          // INTERSECTION
          intersectFeaturesSelected,
        };
      });

      // Filter
      if (search) {
        const fuse = new Fuse(parsedData, {
          keys: ['name'],
          threshold: 0.25,
        });
        parsedData = fuse.search(search).map((f) => {
          return f.item;
        });
      }

      // Sort
      parsedData = orderBy(parsedData, ['type', 'name'], ['asc', 'asc']);

      parsedData = flatten(
        parsedData.map((s) => {
          const { id, name, splitSelected, splitFeaturesSelected, marxanSettings } = s;
          const isSplitted = !!splitSelected;
          // const isIntersected = !!intersectFeaturesSelected?.length;

          // Generate splitted features to target
          if (isSplitted) {
            return splitFeaturesSelected
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((sf) => {
                const { id: sfId, name: sfName, marxanSettings: sfMarxanSettings } = sf;

                return {
                  ...sf,
                  id: `${id}-${sfId}`,
                  parentId: id,
                  name: `${name} / ${sfName}`,
                  splitted: true,
                  splitSelected,
                  splitFeaturesSelected,
                  ...(!!sfMarxanSettings && {
                    target: sfMarxanSettings.prop * 100,
                    fpf: sfMarxanSettings.fpf,
                  }),
                };
              });
          }

          // if (isIntersected) {
          //   return flatten(intersectFeaturesSelected.map((ifs) => {
          //     const {
          //       value: ifId,
          //       label: ifName,
          //       marxanSettings: ifMarxanSettings,
          //     } = ifs;

          //     return {
          //       ...ifs,
          //       id: `${id}-${ifId}`,
          //       parentId: id,
          //       name: `${name} / ${ifName}`,
          //       splitted: true,
          //       ...!!ifMarxanSettings && {
          //         target: ifMarxanSettings.prop * 100,
          //         fpf: ifMarxanSettings.fpf,
          //       },
          //     };
          //   }));
          // }

          return {
            ...s,
            ...(!!marxanSettings && {
              target: marxanSettings.prop * 100,
              fpf: marxanSettings.fpf,
            }),
          };
        })
      );

      return parsedData;
    },
    placeholderData: { data: {} as GeoFeatureSet },
  });
}

export function useSaveSelectedFeatures({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveSelectedFeaturesProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const saveFeature = ({ id, data }: SaveSelectedFeaturesProps) => {
    return SCENARIOS.request({
      url: `/${id}/features/specification`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    }).then(({ data }) => data);
  };

  return useMutation(saveFeature, {
    onSuccess: (data, variables, context) => {
      const { id } = variables;
      queryClient.setQueryData(['selected-features', id], { data: data?.data });

      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useFeature(id) {
  const { data: session } = useSession();

  const query = useQuery(
    ['features', id],
    async () =>
      GEOFEATURES.request({
        method: 'GET',
        url: `/${id}`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }),
    {
      enabled: !!id,
    }
  );

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data?.data,
    };
  }, [query, data?.data?.data]);
}

export function useUploadFeaturesShapefile({
  requestConfig = {
    method: 'POST',
  },
}: {
  requestConfig?: AxiosRequestConfig<FormData>;
}) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const uploadFeatureShapefile = ({ id, data }: { id: Project['id']; data: FormData }) => {
    return UPLOADS.request<{ success: true }>({
      url: `/projects/${id}/features/shapefile`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      ...requestConfig,
    } as typeof requestConfig);
  };

  return useMutation(uploadFeatureShapefile, {
    onSuccess: async (data, variables) => {
      const { id: projectId } = variables;
      await queryClient.invalidateQueries(['all-features', projectId]);
    },
  });
}

export function useUploadFeaturesCSV({
  requestConfig = {
    method: 'POST',
  },
}: {
  requestConfig?: AxiosRequestConfig<FormData>;
}) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const uploadFeatureCSV = ({ id, data }: { id: Project['id']; data: FormData }) => {
    return UPLOADS.request<{ success: true }>({
      url: `/projects/${id}/features/csv`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      ...requestConfig,
    } as typeof requestConfig);
  };

  return useMutation(uploadFeatureCSV, {
    onSuccess: async (data, variables) => {
      const { id: projectId } = variables;
      await queryClient.invalidateQueries(['all-features', projectId]);
    },
  });
}

export function useEditFeature() {
  const { data: session } = useSession();

  const editFeature = ({
    fid,
    body = {},
  }: {
    fid: Feature['id'];
    body: Record<string, unknown>;
  }) => {
    return GEOFEATURES.patch<Feature>(
      `/${fid}`,
      {
        ...body,
      },
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );
  };

  return useMutation(editFeature);
}

export function useEditFeatureTag() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const editFeatureTag = ({
    featureId,
    projectId,
    data,
  }: {
    featureId: Feature['id'];
    projectId: Project['id'];
    data: {
      tagName: Feature['tag'];
    };
  }) => {
    return PROJECTS.request({
      method: 'PATCH',
      url: `/${projectId}/features/${featureId}/tags`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
  };

  return useMutation(editFeatureTag, {
    onSuccess: async (data, variables) => {
      const { featureId, projectId } = variables;
      await queryClient.invalidateQueries(['feature', featureId]);
      await queryClient.invalidateQueries(['project-tags', projectId]);
      await queryClient.invalidateQueries(['all-features', projectId]);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useDeleteFeatureTag() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const deleteFeatureTag = ({
    featureId,
    projectId,
  }: {
    featureId: Feature['id'];
    projectId: Project['id'];
  }) => {
    return PROJECTS.request({
      method: 'DELETE',
      url: `/${projectId}/features/${featureId}/tags`,

      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
  };

  return useMutation(deleteFeatureTag, {
    onSuccess: async (data, variables) => {
      const { featureId, projectId } = variables;
      await queryClient.invalidateQueries(['feature', featureId]);
      await queryClient.invalidateQueries(['all-features', projectId]);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useProjectFeatures(
  projectId: Project['id'],
  featureIds: Feature['id'][] | Feature['id']
) {
  return useAllFeatures(
    projectId,
    {},
    {
      select: (data) => data?.data.filter((f) => featureIds.includes(f.id)),
    }
  );
}
