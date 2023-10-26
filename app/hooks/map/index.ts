import { useMemo } from 'react';

import chroma from 'chroma-js';
import { Layer } from 'mapbox-gl';

import { CostSurface } from 'types/api/cost-surface';
import { Project } from 'types/api/project';

import { COLORS, LEGEND_LAYERS } from './constants';
import {
  UseGeoJSONLayer,
  UseAdminPreviewLayer,
  UsePlanningAreaPreviewLayer,
  UseWDPAPreviewLayer,
  UseFeaturePreviewLayer,
  UseFeaturePreviewLayers,
  UsePUGridPreviewLayer,
  UseProyectPlanningAreaLayer,
  UseProyectGridLayer,
  UsePUGridLayer,
  UsePUCompareLayer,
  UseLegend,
  UseGridPreviewLayer,
  UseScenarioBLMLayer,
  UseBbox,
  UseTargetedPreviewLayers,
} from './types';

/**
 *******************************************************************
 * GLOBAL LAYERS
 *******************************************************************
 */
export function useGeoJsonLayer({ id, active, data, options }: UseGeoJSONLayer) {
  const { customPAshapefileGrid } = options || {};

  return useMemo(() => {
    if (!active || !id || !data) return null;

    return {
      id: `${id}`,
      type: 'geojson',
      source: {
        type: 'geojson',
        data,
      },
      render: {
        layers: [
          {
            type: 'line',
            paint: {
              'line-color': customPAshapefileGrid ? COLORS.primary : '#FFF',
              'line-width': 3,
            },
          },
        ],
      },
    };
  }, [id, active, data, customPAshapefileGrid]);
}

/**
 *******************************************************************
 * PREVIEW LAYERS
 *******************************************************************
 */

// Admin preview layer
export function useAdminPreviewLayer({
  active,
  country,
  region,
  subregion,
  cache = 0,
}: UseAdminPreviewLayer) {
  const level = useMemo(() => {
    if (subregion) return 2;
    if (region) return 1;
    if (country) return 0;

    return null;
  }, [country, region, subregion]);

  const guid = subregion || region || country;

  return useMemo(() => {
    if (!active || typeof level === 'undefined' || !guid) return null;

    return {
      id: `admin-preview-layer-${guid}-${cache}`,
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/administrative-areas/${level}/preview/tiles/{z}/{x}/{y}.mvt?guid=${guid}`,
        ],
      },
      render: {
        layers: [
          {
            type: 'line',
            'source-layer': 'layer0',
            paint: {
              'line-color': '#FFF',
              'line-width': 3,
            },
          },
        ],
      },
    };
  }, [active, level, guid, cache]);
}

// Planning area preview layer
export function usePlanningAreaPreviewLayer({
  active,
  planningAreaId,
  cache = 0,
}: UsePlanningAreaPreviewLayer) {
  return useMemo(() => {
    if (!active || !planningAreaId) return null;

    return {
      id: `planning-area-preview-layer-${planningAreaId}-${cache}`,
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/planning-area/${planningAreaId}/preview/tiles/{z}/{x}/{y}.mvt`,
        ],
      },
      render: {
        layers: [
          {
            type: 'line',
            'source-layer': 'layer0',
            paint: {
              'line-color': '#FFF',
              'line-width': 3,
            },
          },
        ],
      },
    };
  }, [active, planningAreaId, cache]);
}

export function useGridPreviewLayer({ active, gridId, cache = 0 }: UseGridPreviewLayer) {
  return useMemo(() => {
    if (!active || !gridId) return null;

    return {
      id: `grid-preview-layer-${gridId}-${cache}`,
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/planning-area/${gridId}/grid/preview/tiles/{z}/{x}/{y}.mvt`,
        ],
      },
      render: {
        layers: [
          {
            type: 'line',
            'source-layer': 'layer0',
            paint: {
              'line-width': 1,
              'line-color': COLORS.primary,
              'line-opacity': 0.5,
            },
          },
        ],
      },
    };
  }, [active, gridId, cache]);
}

export function useCostSurfaceLayer({
  active,
  pid,
  costSurfaceId,
  layerSettings,
}: {
  active: boolean;
  pid: Project['id'];
  costSurfaceId: CostSurface['id'];
  layerSettings: UsePUGridLayer['options']['settings']['cost-surface'];
}): Layer {
  return useMemo(() => {
    if (!active) return null;

    return {
      id: `cost-surface-layer-${pid}-${costSurfaceId}`,
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${pid}/cost-surfaces/${costSurfaceId}/preview/tiles/{z}/{x}/{y}.mvt`,
        ],
      },
      render: {
        layers: [
          {
            type: 'fill',
            'source-layer': 'layer0',
            layout: {
              visibility: layerSettings.visibility ? 'visible' : 'none',
            },
            paint: {
              'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'cost'],
                layerSettings.min === layerSettings.max ? 0 : layerSettings.min,
                COLORS.cost[0],
                layerSettings.max,
                COLORS.cost[1],
              ],
              'fill-opacity': 0.75 * (layerSettings.opacity || 1),
            },
          },
        ],
      },
    };
  }, [active, pid, costSurfaceId, layerSettings]);
}

// WDPA preview layer
export function useWDPAPreviewLayer({
  pid,
  active,
  bbox,
  WDPACategories = [],
  cache = 0,
  options,
}: UseWDPAPreviewLayer) {
  const { layerSettings } = options || {};

  return useMemo(() => {
    if (!active || !bbox) return null;

    const visibleCategories = WDPACategories.filter((id) => layerSettings[id]?.visibility);

    return {
      id: `wdpa-preview-layer-${cache}`,
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/protected-areas/${pid}/preview/tiles/{z}/{x}/{y}.mvt?bbox=[${bbox}]`,
        ],
      },
      render: {
        layers: [
          {
            type: 'fill',
            'source-layer': 'layer0',
            layout: {
              visibility: 'visible',
            },
            // wdpaIucnCategories are filtered in two steps as they are custom and WDPA.
            // We have not way to separate them into two arrays but it would be ideal
            filter: [
              'any',
              ['all', ['in', ['get', 'iucn_cat'], ['literal', visibleCategories]]],
              ['all', ['in', ['get', 'id'], ['literal', visibleCategories]]],
            ],
            paint: {
              'fill-color': COLORS['wdpa-preview'],
            },
          },
          {
            type: 'line',
            'source-layer': 'layer0',
            layout: {
              visibility: 'visible',
            },
            filter: [
              'any',
              ['all', ['in', ['get', 'iucn_cat'], ['literal', visibleCategories]]],
              ['all', ['in', ['get', 'id'], ['literal', visibleCategories]]],
            ],
            paint: {
              'line-color': '#000',
            },
          },
        ],
      },
    };
  }, [pid, active, bbox, WDPACategories, cache, layerSettings]);
}

// Feature preview layer
export function useFeaturePreviewLayer({ active, bbox, id, cache = 0 }: UseFeaturePreviewLayer) {
  return useMemo(() => {
    if (!active || !bbox) return null;

    return {
      id: `feature-${id}-preview-layer-${cache}`,
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/geo-features/${id}/preview/tiles/{z}/{x}/{y}.mvt?bbox=[${bbox}]`,
        ],
      },
      render: {
        layers: [
          {
            type: 'fill',
            'source-layer': 'layer0',
            paint: {
              'fill-color': COLORS.primary,
              'fill-opacity': 0.5,
            },
          },
          {
            type: 'line',
            'source-layer': 'layer0',
            paint: {
              'line-color': '#000',
            },
          },
        ],
      },
    };
  }, [active, bbox, id, cache]);
}

export function useFeaturePreviewLayers({
  active,
  bbox,
  features,
  cache = 0,
  options = {},
}: UseFeaturePreviewLayers) {
  return useMemo(() => {
    if (!active || !bbox || !features) return [];

    const { featuresRecipe = [], selectedFeatures = [], layerSettings } = options;

    const FEATURES = [...features]
      .filter((ft) => selectedFeatures.includes(ft.id as string))
      .sort((a, b) => {
        const aIndex = selectedFeatures.indexOf(a.id as string);
        const bIndex = selectedFeatures.indexOf(b.id as string);
        return bIndex - aIndex;
      });

    const getLayerVisibility = (
      visibility: (typeof layerSettings)[string]['visibility']
    ): 'visible' | 'none' => {
      if (!visibility) {
        return 'none';
      }

      return 'visible';
    };

    return FEATURES.map((f) => {
      const { id } = f;
      const F = featuresRecipe.find((fr) => fr.id === id) || f;
      const settings = layerSettings[id] || { visibility: true, opacity: 1, color: '#000' };

      return {
        id: `feature-${id}-preview-layer-${cache}`,
        type: 'vector',
        source: {
          type: 'vector',
          tiles: [
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/geo-features/${id}/preview/tiles/{z}/{x}/{y}.mvt?bbox=[${bbox}]`,
          ],
        },
        render: {
          layers: [
            {
              type: 'fill',
              'source-layer': 'layer0',
              ...(F.splitSelected && {
                filter: [
                  'all',
                  [
                    'in',
                    ['to-string', ['get', F.splitSelected]],
                    ['literal', F.splitFeaturesSelected.map((s) => s.id)],
                  ],
                ],
              }),
              layout: {
                visibility: getLayerVisibility(settings?.visibility),
              },
              paint: {
                'fill-color': settings?.color,
                'fill-opacity': settings?.opacity,
              },
            },
            {
              type: 'line',
              'source-layer': 'layer0',
              ...(F.splitSelected && {
                filter: [
                  'all',
                  [
                    'in',
                    ['to-string', ['get', F.splitSelected]],
                    ['literal', F.splitFeaturesSelected.map((s) => s.id)],
                  ],
                ],
              }),
              layout: {
                visibility: getLayerVisibility(settings?.visibility),
              },
              paint: {
                'line-color': '#000',
                'line-opacity': 0.5 * settings?.opacity,
              },
            },
          ],
        },
      };
    });
  }, [active, bbox, features, cache, options]);
}

export function useTargetedPreviewLayers({
  active,
  bbox,
  features,
  cache = 0,
  options = {},
}: UseTargetedPreviewLayers) {
  return useMemo(() => {
    if (!active || !bbox || !features) return [];

    const { selectedFeatures = [] } = options;

    const FEATURES = [...features]
      .filter((ft) => selectedFeatures.includes(ft.id as string))
      .sort((a, b) => {
        const aIndex = selectedFeatures.indexOf(a.id as string);
        const bIndex = selectedFeatures.indexOf(b.id as string);
        return bIndex - aIndex;
      });

    const { opacity = 1, visibility = true } = options || {};

    const getLayerVisibility = () => {
      if (!visibility) {
        return 'none';
      }
      return 'visible';
    };

    return FEATURES.map((f, index) => {
      const { id, parentId, splitted, value } = f;

      const ID = splitted ? parentId : id;

      const COLOR =
        selectedFeatures.length > COLORS['features-preview'].ramp.length
          ? chroma.scale(COLORS['features-preview'].ramp).colors(selectedFeatures.length)[
              selectedFeatures.length - 1 - index
            ]
          : COLORS['features-preview'].ramp[selectedFeatures.length - 1 - index];

      return {
        id: `feature-${id}-targeted-preview-layer-${cache}`,
        type: 'vector',
        source: {
          type: 'vector',
          tiles: [
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/geo-features/${ID}/preview/tiles/{z}/{x}/{y}.mvt?bbox=[${bbox}]`,
          ],
        },
        render: {
          layers: [
            {
              type: 'fill',
              'source-layer': 'layer0',
              ...(f.splitSelected && {
                filter: [
                  'all',
                  ['in', ['to-string', ['get', f.splitSelected]], ['literal', [value]]],
                ],
              }),
              layout: {
                visibility: getLayerVisibility(),
              },
              paint: {
                'fill-color': COLOR,
                'fill-opacity': opacity,
              },
            },
            {
              type: 'line',
              'source-layer': 'layer0',
              ...(f.splitSelected && {
                filter: [
                  'all',
                  ['in', ['to-string', ['get', f.splitSelected]], ['literal', [value]]],
                ],
              }),
              layout: {
                visibility: getLayerVisibility(),
              },
              paint: {
                'line-color': '#000',
                'line-opacity': 0.5 * opacity,
              },
            },
          ],
        },
      };
    });
  }, [active, bbox, features, cache, options]);
}

// PU Grid preview layer
export function usePUGridPreviewLayer({
  active,
  bbox,
  planningUnitGridShape,
  planningUnitAreakm2,
  cache,
  options = {},
}: UsePUGridPreviewLayer) {
  return useMemo(() => {
    if (!active || !bbox || !planningUnitGridShape || !planningUnitAreakm2) return null;

    const {
      settings = {
        opacity: 1,
        visibility: true,
      },
    } = options;

    const getLayerVisibility = () => {
      if (!settings?.visibility) {
        return 'none';
      }
      return 'visible';
    };

    return {
      id: `pu-grid-preview-layer-${cache}`,
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/planning-units/preview/regular/${planningUnitGridShape}/${planningUnitAreakm2}/tiles/{z}/{x}/{y}.mvt?bbox=[${bbox}]`,
        ],
      },
      render: {
        layers: [
          {
            type: 'line',
            'source-layer': 'layer0',
            layout: {
              visibility: getLayerVisibility(),
            },
            paint: {
              'line-color': COLORS.primary,
              'line-opacity': 0.5 * settings?.opacity,
            },
          },
        ],
      },
    };
  }, [active, bbox, planningUnitGridShape, planningUnitAreakm2, cache, options]);
}

/**
 *******************************************************************
 * PROYECT LAYERS
 *******************************************************************
 */

export function useProjectPlanningAreaLayer({
  active,
  pId,
  cache = 0,
}: UseProyectPlanningAreaLayer) {
  return useMemo(() => {
    if (!active || !pId) return null;

    return {
      id: `proyect-planning-area-layer-${pId}-${cache}`,
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${pId}/planning-area/tiles/{z}/{x}/{y}.mvt`,
        ],
      },
      render: {
        layers: [
          {
            type: 'line',
            'source-layer': 'layer0',
            paint: {
              'line-color': '#FFF',
              'line-width': 3,
            },
          },
        ],
      },
    };
  }, [active, pId, cache]);
}

export function useProjectGridLayer({ active, pId, cache = 0 }: UseProyectGridLayer) {
  return useMemo(() => {
    if (!active || !pId) return null;

    return {
      id: `proyect-grid-layer-${pId}-${cache}`,
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${pId}/grid/tiles/{z}/{x}/{y}.mvt`,
        ],
      },
      render: {
        layers: [
          {
            type: 'line',
            'source-layer': 'layer0',
            paint: {
              'line-color': COLORS.primary,
              'line-opacity': 0.5,
            },
          },
        ],
      },
    };
  }, [active, pId, cache]);
}

/**
 *******************************************************************
 * GRID LAYERS
 *******************************************************************
 */
export function usePUGridLayer({
  active,
  sid,
  include,
  sublayers,
  options = {},
  cache,
}: UsePUGridLayer) {
  return useMemo(() => {
    if (!active || !sid) return null;
    const {
      wdpaIucnCategories = [],
      wdpaThreshold = 0,
      puIncludedValue,
      puExcludedValue,
      puAvailableValue,
      selectedFeatures = [],
      preHighlightFeatures = [],
      postHighlightFeatures = [],
      runId,
      settings = {},
    } = options;
    const {
      pugrid: PUgridSettings = {},
      'wdpa-percentage': WdpaPercentageSettings = {},
      'lock-in': LockInSettings = {},
      'lock-out': LockOutSettings = {},
      'lock-available': LockAvailableSettings = {},
      frequency: FrequencySettings = {},
      solution: SolutionSettings = {},
      ...restLayerSettings
    } = settings;

    const { opacity: PUgridOpacity = 1, visibility: PUgridVisibility = true } = PUgridSettings;
    const { opacity: WdpaPercentageOpacity = 1, visibility: WdpaPercentageVisibility = true } =
      WdpaPercentageSettings;
    const { opacity: LockInOpacity = 1, visibility: LockInVisibility = true } = LockInSettings;
    const { opacity: LockOutOpacity = 1, visibility: LockOutVisibility = true } = LockOutSettings;
    const { opacity: LockAvailableOpacity = 1, visibility: LockAvailableVisibility = true } =
      LockAvailableSettings;
    const { opacity: FrequencyOpacity = 1, visibility: FrequencyVisibility = true } =
      FrequencySettings;
    const { opacity: SolutionOpacity = 1, visibility: SolutionVisibility = true } =
      SolutionSettings;

    const getLayerVisibility = (layer) => {
      if (!layer) {
        return 'none';
      }
      return 'visible';
    };

    return {
      id: `pu-grid-layer-${cache}`,
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/scenarios/${sid}/planning-units/tiles/{z}/{x}/{y}.mvt?include=${include}`,
        ],
      },
      render: {
        layers: [
          {
            type: 'fill',
            'source-layer': 'layer0',
            layout: {
              visibility: getLayerVisibility(PUgridVisibility),
            },
            paint: {
              'fill-color': '#000',
              'fill-opacity': 0,
            },
          },
          {
            type: 'line',
            'source-layer': 'layer0',
            layout: {
              visibility: getLayerVisibility(PUgridVisibility),
            },
            paint: {
              'line-color': COLORS.primary,
              'line-opacity': 0.5 * PUgridOpacity,
              'line-width': 1,
              'line-offset': 0.5,
            },
          },

          // ANALYSIS - GAP ANALYSIS
          ...(sublayers.includes('features')
            ? [
                ...preHighlightFeatures.map((id) => ({
                  type: 'fill',
                  'source-layer': 'layer0',
                  layout: {
                    visibility: getLayerVisibility(restLayerSettings[id]?.visibility || 1),
                  },
                  paint: {
                    'fill-color': COLORS.highlightFeatures,
                    'fill-opacity': [
                      'case',
                      ['any', ['in', id, ['get', 'featureList']]],
                      0.5 * restLayerSettings[id]?.opacity || 1,
                      0,
                    ],
                  },
                })),
                ...postHighlightFeatures.map((id) => ({
                  type: 'fill',
                  'source-layer': 'layer0',
                  layout: {
                    visibility: getLayerVisibility(restLayerSettings[id]?.visibility || 1),
                  },
                  paint: {
                    'fill-color': COLORS.highlightFeatures,
                    'fill-opacity': [
                      'case',
                      ['any', ['in', id, ['get', 'featureList']]],
                      0.5 * restLayerSettings[id]?.opacity || 1,
                      0,
                    ],
                  },
                })),
                // features abundance
                ...selectedFeatures.map((featureId) => {
                  const {
                    visibility = true,
                    opacity = 1,
                    amountRange = { min: 50000, max: 1000000 },
                  } = restLayerSettings[featureId] || {};

                  return {
                    type: 'fill',
                    'source-layer': 'layer0',
                    layout: {
                      visibility: getLayerVisibility(visibility),
                    },
                    filter: ['all', ['in', featureId, ['get', 'featureList']]],
                    paint: {
                      'fill-outline-color': 'yellow',
                      'fill-color': [
                        'let',
                        'amount',
                        [
                          'to-number',
                          [
                            'let',
                            'idx',
                            ['index-of', featureId, ['get', 'featureList']],
                            [
                              'slice',
                              ['get', 'featureList'],
                              ['+', ['index-of', ':', ['get', 'featureList'], ['var', 'idx']], 1],
                              ['index-of', ';', ['get', 'featureList'], ['var', 'idx']],
                            ],
                          ],
                        ],
                        [
                          'interpolate',
                          ['linear'],
                          ['var', 'amount'],
                          amountRange.min,
                          'white', // ! use COLORS.abundance.default instead when is available
                          amountRange.max,
                          'green',
                          // color, // ! enable the color variable when we receive it
                        ],
                      ],
                      'fill-opacity': opacity,
                    },
                  };
                }),
              ]
            : []),

          // PROTECTED AREAS
          ...(sublayers.includes('wdpa-percentage') &&
          wdpaThreshold !== null &&
          !!wdpaIucnCategories.length
            ? [
                {
                  type: 'fill',
                  'source-layer': 'layer0',
                  layout: {
                    visibility: getLayerVisibility(WdpaPercentageVisibility),
                  },
                  paint: {
                    'fill-color': COLORS.wdpa,
                    'fill-opacity': [
                      'case',
                      [
                        'all',
                        ['has', 'percentageProtected'],
                        ['>=', ['get', 'percentageProtected'], wdpaThreshold],
                      ],
                      0.9 * WdpaPercentageOpacity,
                      0,
                    ],
                  },
                },
              ]
            : []),

          // ANALYSIS - ADJUST PLANNING UNITS
          ...(sublayers.includes('lock-in') && !!puIncludedValue
            ? [
                {
                  type: 'line',
                  'source-layer': 'layer0',
                  layout: {
                    visibility: getLayerVisibility(LockInVisibility),
                  },
                  filter: ['all', ['in', ['get', 'scenarioPuId'], ['literal', puIncludedValue]]],
                  paint: {
                    'line-color': COLORS.include,
                    'line-opacity': 1 * LockInOpacity,
                    'line-width': 1.5,
                    'line-offset': 0.75,
                  },
                },
              ]
            : []),
          ...(sublayers.includes('lock-out') && !!puExcludedValue
            ? [
                {
                  type: 'line',
                  'source-layer': 'layer0',
                  layout: {
                    visibility: getLayerVisibility(LockOutVisibility),
                  },
                  filter: ['all', ['in', ['get', 'scenarioPuId'], ['literal', puExcludedValue]]],
                  paint: {
                    'line-color': COLORS.exclude,
                    'line-opacity': 1 * LockOutOpacity,
                    'line-width': 1.5,
                    'line-offset': 0.75,
                  },
                },
              ]
            : []),
          ...(sublayers.includes('lock-available') && !!puAvailableValue
            ? [
                {
                  type: 'line',
                  'source-layer': 'layer0',
                  layout: {
                    visibility: getLayerVisibility(LockAvailableVisibility),
                  },
                  filter: ['all', ['in', ['get', 'scenarioPuId'], ['literal', puAvailableValue]]],
                  paint: {
                    'line-color': COLORS.available,
                    'line-opacity': 1 * LockAvailableOpacity,
                    'line-width': 1.5,
                    'line-offset': 0.75,
                  },
                },
              ]
            : []),

          // SOLUTIONS - FREQUENCY
          ...(sublayers.includes('frequency')
            ? [
                {
                  type: 'fill',
                  'source-layer': 'layer0',
                  layout: {
                    visibility: getLayerVisibility(FrequencyVisibility),
                  },
                  paint: {
                    'fill-color': [
                      'interpolate',
                      ['linear'],
                      ['get', 'frequencyValue'],
                      0,
                      COLORS.frequency[0],
                      33.33,
                      COLORS.frequency[1],
                      66.66,
                      COLORS.frequency[2],
                      100,
                      COLORS.frequency[3],
                    ],
                    'fill-opacity': 0.75 * FrequencyOpacity,
                  },
                },
              ]
            : []),

          ...(sublayers.includes('solution')
            ? [
                {
                  type: 'fill',
                  'source-layer': 'layer0',
                  layout: {
                    visibility: getLayerVisibility(SolutionVisibility),
                  },
                  filter: ['all', ['in', `-${runId}-`, ['get', 'valuePosition']]],
                  paint: {
                    'fill-color': COLORS.primary,
                    'fill-opacity': 0.75 * SolutionOpacity,
                  },
                },
              ]
            : []),
        ],
      },
    };
  }, [cache, active, sid, options, include, sublayers]);
}

export function usePUCompareLayer({ active, sid, sid2, cache = 0, options }: UsePUCompareLayer) {
  const COLOR_NUMBER = 10;

  const COLOR_RAMP = useMemo(() => {
    const colors = [...Array((COLOR_NUMBER + 1) * (COLOR_NUMBER + 1)).keys()];

    return colors
      .map((c, i) => {
        const position = `${Math.floor((i / (COLOR_NUMBER + 1)) % (COLOR_NUMBER + 1))}${
          i % (COLOR_NUMBER + 1)
        }`;
        const color = Object.keys(COLORS.compare).reduce((acc, k) => {
          if (COLORS.compare[k].includes(position) && !acc) {
            return k;
          }

          return acc;
        }, '');

        return [position, color];
      })
      .flat();
  }, [COLOR_NUMBER]);

  return useMemo(() => {
    if (!active) return null;

    const { opacity = 1, visibility = true } = options || {};

    return {
      id: `pu-grid-layer-${sid}-${sid2}-${cache}`,
      type: 'vector',
      opacity,
      visibility,
      source: {
        type: 'vector',
        tiles: [
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/scenarios/${sid}/compare/${sid2}/tiles/{z}/{x}/{y}.mvt`,
        ],
      },
      render: {
        layers: [
          {
            type: 'fill',
            'source-layer': 'layer0',
            paint: {
              'fill-color': [
                'match',
                [
                  'concat',
                  ['ceil', ['/', ['*', ['get', 'freqA'], 100], 100 / COLOR_NUMBER]],
                  ['ceil', ['/', ['*', ['get', 'freqB'], 100], 100 / COLOR_NUMBER]],
                ],
                ...COLOR_RAMP,
                '#FFF',
              ],
              'fill-opacity': 1,
            },
          },
          {
            type: 'line',
            'source-layer': 'layer0',
            paint: {
              'line-color': '#000',
              'line-opacity': 0,
            },
          },
        ],
      },
    };
  }, [active, sid, sid2, cache, options, COLOR_RAMP]);
}

export function useScenarioBlmLayer({ active, sId, blm, cache = 0 }: UseScenarioBLMLayer) {
  return useMemo(() => {
    if (!active || !sId) return null;

    return {
      id: `scenario-blm-layer-${sId}-${blm}-${cache}`,
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/scenarios/${sId}/calibration/tiles/${blm}/{z}/{x}/{y}.mvt`,
        ],
      },
      render: {
        layers: [
          {
            type: 'fill',
            'source-layer': 'layer0',
            filter: ['all', ['has', 'pu_ids']],
            paint: {
              'fill-color': COLORS.primary,
              'fill-opacity': 0.5,
            },
          },
        ],
      },
    };
  }, [active, sId, blm, cache]);
}

/**
 *******************************************************************
 * LEGEND
 *******************************************************************
 */
export function useLegend({ layers, options = {} }: UseLegend) {
  return useMemo(() => {
    const { layerSettings = {}, items = [] } = options;

    return layers
      .map((l) => {
        const L = LEGEND_LAYERS[l];

        if (L) {
          return {
            ...L({
              ...options,
              ...layerSettings[l],
              ...items,
            }),
            settings: layerSettings[l],
          };
        }

        return null;
      })
      .filter((l) => !!l);
  }, [layers, options]);
}

/**
 *******************************************************************
 * UTILS
 *******************************************************************
 */
export function useBBOX({ bbox }: UseBbox) {
  return useMemo(() => {
    if (bbox) {
      if (bbox[0] < bbox[1]) {
        return [bbox[0] + 360, bbox[1], bbox[2], bbox[3]];
      }
      return bbox;
    }

    return null;
  }, [bbox]);
}
