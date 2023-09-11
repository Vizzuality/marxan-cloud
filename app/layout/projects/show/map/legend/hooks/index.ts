import { useRouter } from 'next/router';

import { useAppSelector } from 'store/hooks';

import { useProjectCostSurfaces } from 'hooks/cost-surface';
import { useProjectFeatures } from 'hooks/features';
import { LEGEND_LAYERS } from 'hooks/map/constants';
import { useProjectWDPAs } from 'hooks/wdpa';

export const useCostSurfaceLegend = () => {
  const { selectedCostSurfaces } = useAppSelector((state) => state['/projects/[id]']);
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const costSurfaceQuery = useProjectCostSurfaces(
    pid,
    {},
    {
      select: (data) => data.filter((cs) => selectedCostSurfaces.includes(cs.id)),
    }
  );

  // todo: uncomment when API is ready
  // return LEGEND_LAYERS['cost-surface']({
  //   items: costSurfaceQuery.data?.map(({ name, min = 1, max = 8 }) => ({ name, min, max })) || [],
  // });

  return LEGEND_LAYERS['cost-surface']({
    items: [
      { name: 'Cost Surface 2', min: 1, max: 22 },
      { name: 'Cost Surface 4', min: 1, max: 11 },
      { name: 'Cost Surface 5', min: 1, max: 5 },
    ],
  });
};

export const useConservationAreasLegend = () => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };
  const { selectedWDPAs } = useAppSelector((state) => state['/projects/[id]']);

  const protectedAreaQuery = useProjectWDPAs(
    pid,
    {},
    { select: (data) => data.filter(({ id }) => selectedWDPAs.includes(id)) }
  );

  // todo: uncomment when API is ready
  // return LEGEND_LAYERS['designated-areas']({
  //   items: protectedAreaQuery.data?.map(({ id }) => ({ name: id })) || [],
  // });

  return LEGEND_LAYERS['designated-areas']({
    items: [{ name: 'WDPA 1' }, { name: 'WDPA 2' }, { name: 'WDPA 3' }],
  });
};

export const useFeatureAbundanceLegend = () => {
  const { selectedFeatures } = useAppSelector((state) => state['/projects/[id]']);
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const projectFeaturesQuery = useProjectFeatures(pid, selectedFeatures);

  // todo: uncomment when API is ready
  // return projectFeaturesQuery.data?.map(
  //   ({ featureClassName: name }, index) =>
  //     LEGEND_LAYERS['features-abundance']({
  //       abundance: {
  //         min: 1,
  //         max: 8,
  //         name,
  //         index,
  //       },
  //     }) || []
  // );

  return LEGEND_LAYERS['features-abundance']({
    items: [
      {
        min: 1,
        max: 8,
        name: 'feature abundance A',
      },
      {
        min: 2,
        max: 5,
        name: 'feature abundance B',
      },
      {
        min: 8,
        max: 34,
        name: 'feature abundance C',
      },
    ],
  });
};

export const useFeatureLegend = () => {
  const { selectedFeatures } = useAppSelector((state) => state['/projects/[id]']);
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const projectFeaturesQuery = useProjectFeatures(pid, selectedFeatures);

  return LEGEND_LAYERS['features-preview-new']({
    items:
      projectFeaturesQuery.data?.map(({ id, featureClassName: name }) => ({
        id,
        name,
      })) || [],
  });
};

export const useInventoryLegend = () => {
  return [
    {
      name: 'Planning Grid',
      layers: [LEGEND_LAYERS['pugrid']()],
      subgroups: [
        {
          name: 'Cost Surface',
          layers: useCostSurfaceLegend(),
        },
      ],
    },
    {
      name: 'Designated Areas',
      subgroups: [
        {
          name: 'Conservation Areas',
          layers: useConservationAreasLegend(),
        },
        {
          name: 'Conservation Areas 2',
          layers: useConservationAreasLegend(),
        },
      ],
    },
    {
      name: 'Features (Continuous)',
      layers: useFeatureAbundanceLegend(),
    },
    {
      name: 'Features (Binary)',
      layers: useFeatureLegend(),
    },
  ];
};
