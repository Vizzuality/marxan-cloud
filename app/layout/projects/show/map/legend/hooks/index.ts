import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  setSelectedFeatures,
  setSelectedContinuousFeatures,
  setLayerSettings,
  setSelectedWDPAs as setVisibleWDPAs,
  setSelectedCostSurface as setVisibleCostSurface,
} from 'store/slices/projects/[id]';

import { useProjectCostSurfaces } from 'hooks/cost-surface';
import { useAllFeatures, useColorFeatures } from 'hooks/features';
import { LEGEND_LAYERS } from 'hooks/map/constants';
import { useScenario } from 'hooks/scenarios';
import { useProjectWDPAs } from 'hooks/wdpa';

import { CostSurface } from 'types/api/cost-surface';
import { Feature } from 'types/api/feature';
import { Scenario } from 'types/api/scenario';
import { WDPA } from 'types/api/wdpa';

export const usePlanningGridLegend = () => {
  const dispatch = useAppDispatch();
  const { layerSettings } = useAppSelector((state) => state['/projects/[id]']);

  return LEGEND_LAYERS['pugrid']({
    onChangeVisibility: () => {
      dispatch(
        setLayerSettings({
          id: 'pugrid',
          settings: {
            visibility: !layerSettings['pugrid']?.visibility,
          },
        })
      );
    },
  });
};

export const useCostSurfaceLegend = () => {
  const { query } = useRouter();
  const { pid } = query as { pid: string; sid: string };

  const dispatch = useAppDispatch();
  const { layerSettings, selectedCostSurface } = useAppSelector((state) => state['/projects/[id]']);

  const costSurfaceQuery = useProjectCostSurfaces(pid, {});

  const costSurfaceIds = costSurfaceQuery.data?.map((cs) => cs.id);

  if (!costSurfaceQuery.data?.length) return [];

  return LEGEND_LAYERS['cost-surface']({
    items: costSurfaceQuery.data,
    onChangeVisibility: (costSurfaceId: CostSurface['id']) => {
      costSurfaceIds.forEach((id) => {
        dispatch(
          setLayerSettings({
            id,
            settings: {
              visibility: id !== costSurfaceId ? false : !layerSettings[costSurfaceId]?.visibility,
            },
          })
        );
      });

      if (costSurfaceId === selectedCostSurface) {
        dispatch(setVisibleCostSurface(null));
      } else {
        dispatch(setVisibleCostSurface(costSurfaceId));
      }
    },
  });
};

export const useConservationAreasLegend = () => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };
  const dispatch = useAppDispatch();
  const { layerSettings, selectedWDPAs: visibleWDPAs } = useAppSelector(
    (state) => state['/projects/[id]']
  );

  const protectedAreaQuery = useProjectWDPAs(
    pid,
    { sort: 'name' },
    {
      select: (data) => data.map(({ id, name }) => ({ id, name })),
    }
  );

  return LEGEND_LAYERS['designated-areas']({
    items: protectedAreaQuery?.data,
    onChangeVisibility: (WDPAId: WDPA['id']) => {
      const newSelectedWDPAs = [...visibleWDPAs];
      const isIncluded = newSelectedWDPAs.includes(WDPAId);
      if (!isIncluded) {
        newSelectedWDPAs.push(WDPAId);
      } else {
        const i = newSelectedWDPAs.indexOf(WDPAId);
        newSelectedWDPAs.splice(i, 1);
      }

      dispatch(setVisibleWDPAs(newSelectedWDPAs));
      dispatch(
        setLayerSettings({
          id: WDPAId,
          settings: {
            visibility: !layerSettings[WDPAId]?.visibility,
          },
        })
      );
    },
  });
};

export const useFeaturesLegend = () => {
  const { selectedFeatures, selectedContinuousFeatures } = useAppSelector(
    (state) => state['/projects/[id]']
  );
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };

  // const queryClient = useQueryClient();

  const featureColors = useColorFeatures(pid, sid);

  const dispatch = useAppDispatch();
  const projectFeaturesQuery = useAllFeatures(
    pid,
    { sort: 'featureClassName' },
    {
      select: ({ data }) => ({
        binaryFeatures: (
          data?.filter(({ amountRange }) => amountRange.min === null && amountRange.max === null) ||
          []
        ).map((feature) => ({
          ...feature,
          color: featureColors?.find(({ id }) => id === feature.id)?.color,
        })),
        continuousFeatures: (
          data?.filter(({ amountRange }) => amountRange.min !== null && amountRange.max !== null) ||
          []
        ).map((feature) => ({
          ...feature,
          color: featureColors?.find(({ id }) => id === feature.id)?.color,
        })),
      }),
      enabled: featureColors.length > 0,
    }
  );

  const binaryFeaturesItems =
    projectFeaturesQuery.data?.binaryFeatures?.map(({ id, alias, featureClassName, color }) => {
      return {
        id,
        name: alias || featureClassName,
        color,
      };
    }) || [];

  const continuousFeaturesItems =
    projectFeaturesQuery.data?.continuousFeatures.map(
      ({ id, featureClassName, amountRange, color }) => {
        return {
          id,
          name: featureClassName,
          amountRange,
          color,
        };
      }
    ) || [];

  return [
    ...LEGEND_LAYERS['binary-features']({
      items: binaryFeaturesItems,
      onChangeVisibility: (featureId: Feature['id']) => {
        const newSelectedFeatures = [...selectedFeatures];
        const isIncluded = newSelectedFeatures.includes(featureId);
        if (!isIncluded) {
          newSelectedFeatures.push(featureId);
        } else {
          const i = newSelectedFeatures.indexOf(featureId);
          newSelectedFeatures.splice(i, 1);
        }
        dispatch(setSelectedFeatures(newSelectedFeatures));

        const { color } = binaryFeaturesItems.find(({ id }) => id === featureId) || {};

        dispatch(
          setLayerSettings({
            id: featureId,
            settings: {
              visibility: !isIncluded,
              color,
            },
          })
        );
      },
    }),
    ...LEGEND_LAYERS['continuous-features']({
      items: continuousFeaturesItems,
      onChangeVisibility: (featureId: Feature['id']) => {
        const { color, amountRange } =
          continuousFeaturesItems.find(({ id }) => id === featureId) || {};

        const newSelectedFeatures = [...selectedContinuousFeatures];
        const isIncluded = newSelectedFeatures.includes(featureId);
        if (!isIncluded) {
          newSelectedFeatures.push(featureId);
        } else {
          const i = newSelectedFeatures.indexOf(featureId);
          newSelectedFeatures.splice(i, 1);
        }
        dispatch(setSelectedContinuousFeatures(newSelectedFeatures));

        dispatch(
          setLayerSettings({
            id: featureId,
            settings: {
              visibility: !isIncluded,
              amountRange,
              color,
            },
          })
        );
      },
    }),
  ];
};

export const useComparisonScenariosLegend = ({
  comparisonSettings = {},
}: {
  comparisonSettings: Parameters<typeof useInventoryLegend>[0]['comparisonSettings'];
}) => {
  const { layerSettings } = useAppSelector((state) => state['/projects/[id]']);
  const dispatch = useAppDispatch();

  const scenenario1Query = useScenario(comparisonSettings.sid1);
  const scenenario2Query = useScenario(comparisonSettings.sid2);

  if (Object.keys(comparisonSettings).length === 0) return [];

  return LEGEND_LAYERS['compare']({
    scenario1: scenenario1Query.data,
    scenario2: scenenario2Query.data,
    onChangeVisibility: () => {
      dispatch(
        setLayerSettings({
          id: 'compare',
          settings: {
            visibility: !layerSettings['compare']?.visibility,
          },
        })
      );
    },
  });
};

export const useInventoryLegend = ({
  isComparisonEnabled = false,
  comparisonSettings = {},
}: {
  isComparisonEnabled?: boolean;
  comparisonSettings?: Partial<{
    sid1: Scenario['id'];
    sid2: Scenario['id'];
  }>;
}) => {
  const comparisonItems = useComparisonScenariosLegend({
    comparisonSettings,
  });

  return [
    {
      name: 'Planning Grid',
      layers: [usePlanningGridLegend()],
      subgroups: [
        ...(isComparisonEnabled
          ? [
              {
                name: 'Solutions distribution',
                layers: [comparisonItems],
              },
            ]
          : []),
        {
          name: 'Cost Surface',
          layers: useCostSurfaceLegend(),
        },
      ],
    },
    {
      name: 'Conservation Areas',
      layers: useConservationAreasLegend(),
    },
    {
      name: 'Features',
      layers: useFeaturesLegend(),
    },
  ];
};
