import { useMemo } from 'react';

import { COLORS, LEGEND_LAYERS } from './constants';
import {
  UseAdminPreviewLayer,
  UseFeaturePreviewLayer,
  UseFeaturePreviewLayers,
  UseGeoJSONLayer,
  UseLegend,
  UsePUGridLayer,
  UsePUGridPreviewLayer,
  UseWDPAPreviewLayer,
} from './types';

// GeoJSON
export function useGeoJsonLayer({
  id, active, data,
}: UseGeoJSONLayer) {
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
              'line-color': '#FFF',
              'line-width': 3,
            },
          },
        ],
      },
    };
  }, [id, active, data]);
}

// AdminPreview
export function useAdminPreviewLayer({
  active, country, region, subregion, cache = 0,
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
        tiles: [`${process.env.NEXT_PUBLIC_API_URL}/api/v1/administrative-areas/${level}/preview/tiles/{z}/{x}/{y}.mvt?guid=${guid}`],
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

// WDPApreview
export function useWDPAPreviewLayer({
  active, bbox, wdpaIucnCategories, cache = 0, options,
}: UseWDPAPreviewLayer) {
  const { opacity = 1 } = options || {};
  return useMemo(() => {
    if (!active || !bbox) return null;

    return {
      id: `wdpa-preview-layer-${cache}`,
      type: 'vector',
      opacity,
      source: {
        type: 'vector',
        tiles: [`${process.env.NEXT_PUBLIC_API_URL}/api/v1/protected-areas/preview/tiles/{z}/{x}/{y}.mvt?bbox=[${bbox}]`],
      },
      render: {
        layers: [
          {
            type: 'fill',
            'source-layer': 'layer0',
            filter: ['all',
              ['in', ['get', 'iucn_cat'], ['literal', wdpaIucnCategories]],
            ],
            paint: {
              'fill-color': COLORS.wdpa,
            },
          },
          {
            type: 'line',
            'source-layer': 'layer0',
            filter: ['all',
              ['in', ['get', 'iucn_cat'], ['literal', wdpaIucnCategories]],
            ],
            paint: {
              'line-color': '#000',
            },
          },
        ],
      },
    };
  }, [active, bbox, wdpaIucnCategories, cache, opacity]);
}

// Featurepreview
export function useFeaturePreviewLayer({
  active, bbox, id, cache = 0,
}: UseFeaturePreviewLayer) {
  return useMemo(() => {
    if (!active || !bbox) return null;

    return {
      id: `feature-${id}-preview-layer-${cache}`,
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [`${process.env.NEXT_PUBLIC_API_URL}/api/v1/geo-features/${id}/preview/tiles/{z}/{x}/{y}.mvt?bbox=[${bbox}]`],
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
  active, bbox, features, cache = 0, options = {},
}: UseFeaturePreviewLayers) {
  return useMemo(() => {
    if (!active || !bbox || !features) return [];
    const FEATURES = [...features];
    const { featureHoverId, settings = {} } = options;

    const currentFeatureHoverIndex = FEATURES.findIndex((f) => f.id === featureHoverId);
    if (currentFeatureHoverIndex > -1) {
      FEATURES.splice(0, 0, FEATURES.splice(currentFeatureHoverIndex, 1)[0]);
    }

    // Layer settings
    const {
      bioregional: BioregionalSettings = {},
      species: SpeciesSettings = {},
    } = settings;

    const {
      opacity: BioregionalOpacity,
      visibility: BioregionalVisibility = true,
    } = BioregionalSettings;
    const {
      opacity: SpeciesOpacity,
      visibility: SpeciesVisibility = true,
    } = SpeciesSettings;

    const Types = {
      bioregional: BioregionalVisibility,
      species: SpeciesVisibility,
    };

    const getLayerVisibility = (type) => {
      if (Types[type]) {
        return 'visible';
      }
      return 'none';
    };

    return FEATURES
      .map((f) => {
        const { id, type } = f;

        const getLayerOpacity = () => {
          if (type === 'bioregional') return BioregionalOpacity;
          if (type === 'species') return SpeciesOpacity;
          return 0.5;
        };

        return {
          id: `feature-${id}-preview-layer-${cache}`,
          type: 'vector',
          source: {
            type: 'vector',
            tiles: [`${process.env.NEXT_PUBLIC_API_URL}/api/v1/geo-features/${id}/preview/tiles/{z}/{x}/{y}.mvt?bbox=[${bbox}]`],
          },
          render: {
            layers: [
              {
                type: 'fill',
                'source-layer': 'layer0',
                layout: {
                  visibility: getLayerVisibility(type),
                },
                paint: {
                  'fill-color': featureHoverId === id ? COLORS[type].hover : COLORS[type].default,
                  'fill-opacity': featureHoverId === id ? 1 : 0.5 * getLayerOpacity(),
                },
              },
              {
                type: 'line',
                'source-layer': 'layer0',
                paint: {
                  'line-color': '#000',
                  'line-opacity': getLayerOpacity(),
                },
                layout: {
                  visibility: getLayerVisibility(type),
                },
              },
            ],
          },
        };
      });
  }, [active, bbox, features, cache, options]);
}

// PUGridpreview
export function usePUGridPreviewLayer({
  active, bbox, planningUnitGridShape, planningUnitAreakm2, cache,
}: UsePUGridPreviewLayer) {
  return useMemo(() => {
    if (!active || !bbox || !planningUnitGridShape || !planningUnitAreakm2) return null;

    return {
      id: `pu-grid-preview-layer-${cache}`,
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [`${process.env.NEXT_PUBLIC_API_URL}/api/v1/planning-units/preview/regular/${planningUnitGridShape}/${planningUnitAreakm2}/tiles/{z}/{x}/{y}.mvt?bbox=[${bbox}]`],
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
  }, [active, bbox, planningUnitGridShape, planningUnitAreakm2, cache]);
}

// PUGrid
export function usePUGridLayer({
  active, sid, include, sublayers, options = {}, cache,
}: UsePUGridLayer) {
  return useMemo(() => {
    if (!active || !sid) return null;

    const {
      wdpaThreshold = 0,
      puIncludedValue,
      puExcludedValue,
      runId,
      settings = {},
    } = options;

    const {
      pugrid: PUgridSettings = {},
      'wdpa-percentage': WdpaPercentageSettings = {},
      cost: CostSettings = {},
      'lock-in': LockInSettings = {},
      'lock-out': LockOutSettings = {},
      frequency: FrequencySettings = {},
      solution: SolutionSettings = {},
    } = settings;

    const {
      opacity: PUgridOpacity = 1,
      visibility: PUgridVisibility = true,
    } = PUgridSettings;
    const {
      opacity: WdpaPercentageOpacity = 0.5,
      visibility: WdpaPercentageVisibility = true,
    } = WdpaPercentageSettings;
    const {
      opacity: CostOpacity = 0.75,
      visibility: CostVisibility = true,
    } = CostSettings;
    const {
      opacity: LockInOpacity = 1,
      visibility: LockInVisibility = true,
    } = LockInSettings;
    const {
      opacity: LockOutOpacity = 1,
      visibility: LockOutVisibility = true,
    } = LockOutSettings;
    const {
      opacity: FrequencyOpacity = 0.75,
      visibility: FrequencyVisibility = true,
    } = FrequencySettings;
    const {
      opacity: SolutionOpacity = 0.75,
      visibility: SolutionVisibility = true,
    } = SolutionSettings;

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
        tiles: [`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scenarios/${sid}/planning-units/tiles/{z}/{x}/{y}.mvt?include=${include}`],
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

          // PROTECTED AREAS

          ...sublayers.includes('wdpa-percentage')
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
                    ['all',
                      ['has', 'percentageProtected'],
                      ['>=', ['get', 'percentageProtected'], (wdpaThreshold)],
                    ],
                    0.5 * WdpaPercentageOpacity,
                    0,
                  ],
                },
              },
            ] : [],

          // ANALYSIS - GAP ANALYSIS
          ...sublayers.includes('features') ? [
            {
              type: 'fill',
              'source-layer': 'layer0',
              paint: {
                'fill-color': COLORS.features,
                'fill-opacity': [
                  'case',
                  ['any',
                    ...(['69088d67-a699-4080-9c2e-d076540c27e0', '70502e30-b6dd-4e40-8bca-1803a6ad5f5f'].map((id) => {
                      return ['in', id, ['get', 'featureList']];
                    })),
                  ],
                  0.5,
                  0,
                ],
              },
            },
          ] : [],

          // ANALYSIS - COST SURFACE
          ...sublayers.includes('cost') ? [
            {
              type: 'fill',
              'source-layer': 'layer0',
              layout: {
                visibility: getLayerVisibility(CostVisibility),
              },
              paint: {
                'fill-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'costValue'],
                  0,
                  COLORS.cost[0],
                  1,
                  COLORS.cost[1],
                ],
                'fill-opacity': 0.75 * CostOpacity,
              },
            },
          ] : [],

          // ANALYSIS - ADJUST PLANNING UNITS
          ...sublayers.includes('lock-in') && !!puIncludedValue ? [
            {
              type: 'line',
              'source-layer': 'layer0',
              layout: {
                visibility: getLayerVisibility(LockInVisibility),
              },
              filter: [
                'all',
                ['in', ['get', 'scenarioPuId'], ['literal', puIncludedValue]],
              ],
              paint: {
                'line-color': COLORS.include,
                'line-opacity': 1 * LockInOpacity,
                'line-width': 1.5,
                'line-offset': 0.75,
              },
            },
          ] : [],
          ...sublayers.includes('lock-out') && !!puExcludedValue ? [
            {
              type: 'line',
              'source-layer': 'layer0',
              layout: {
                visibility: getLayerVisibility(LockOutVisibility),
              },
              filter: [
                'all',
                ['in', ['get', 'scenarioPuId'], ['literal', puExcludedValue]],
              ],
              paint: {
                'line-color': COLORS.exclude,
                'line-opacity': 1 * LockOutOpacity,
                'line-width': 1.5,
                'line-offset': 0.75,
              },
            },
          ] : [],

          // SOLUTIONS - FREQUENCY
          ...sublayers.includes('solutions') ? [
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
            {
              type: 'fill',
              'source-layer': 'layer0',
              layout: {
                visibility: getLayerVisibility(SolutionVisibility),
              },
              filter: [
                'all',
                ['in', `-${runId}-`, ['get', 'valuePosition']],
              ],
              paint: {
                'fill-color': COLORS.primary,
                'fill-opacity': 0.75 * SolutionOpacity,
              },
            },
          ] : [],
        ],
      },
    };
  }, [cache, active, sid, options, include, sublayers]);
}

// PUGrid
export function useLegend({
  type, subtype, options = {},
}: UseLegend) {
  const layers = useMemo(() => {
    const { wdpaIucnCategories = [] } = options;

    if (type === 'protected-areas' && subtype === 'protected-areas-preview' && !!wdpaIucnCategories.length) return ['wdpa-preview', 'pugrid'];
    if (type === 'protected-areas' && subtype === 'protected-areas-percentage' && !!wdpaIucnCategories.length) return ['wdpa-percentage', 'pugrid'];
    if (type === 'features') {
      return [
        ...wdpaIucnCategories?.length ? ['wdpa-percentage'] : [],
        'bioregional',
        'species',
        'pugrid',
      ];
    }
    if (type === 'analysis' && subtype === 'analysis-gap-analysis') return ['features', 'pugrid'];
    if (type === 'analysis' && subtype === 'analysis-cost-surface') return ['cost', 'pugrid'];
    if (type === 'analysis' && subtype === 'analysis-adjust-planning-units') return ['wdpa-percentage', 'lock-in', 'lock-out', 'pugrid'];
    if (type === 'analysis') return ['wdpa-percentage', 'features', 'pugrid'];
    if (type === 'solutions') return ['frequency', 'solution', 'pugrid'];

    return ['pugrid'];
  }, [type, subtype, options]);

  return useMemo(() => {
    const { layerSettings = {} } = options;
    return layers
      .map((l) => {
        const L = LEGEND_LAYERS[l];
        if (L) {
          return {
            ...L(options),
            settings: layerSettings[l],
          };
        }

        return null;
      })
      .filter((l) => !!l);
  }, [layers, options]);
}
