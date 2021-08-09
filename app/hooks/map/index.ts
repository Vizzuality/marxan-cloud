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
  active, bbox, wdpaIucnCategories, cache = 0,
}: UseWDPAPreviewLayer) {
  return useMemo(() => {
    if (!active || !bbox) return null;

    return {
      id: `wdpa-preview-layer-${cache}`,
      type: 'vector',
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
              'fill-color': '#00F',
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
  }, [active, bbox, wdpaIucnCategories, cache]);
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
              'fill-color': '#FFCC00',
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
    const { featureHoverId } = options;

    const currentFeatureHoverIndex = FEATURES.findIndex((f) => f.id === featureHoverId);
    if (currentFeatureHoverIndex > -1) {
      FEATURES.splice(0, 0, FEATURES.splice(currentFeatureHoverIndex, 1)[0]);
    }

    return FEATURES
      .map((f) => {
        const { id, type } = f;

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
                  'fill-color': featureHoverId === id ? '#FF9900' : COLORS[type],
                  'fill-opacity': featureHoverId === id ? 1 : 0.5,
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
  active, sid, type, subtype, options = {}, cache,
}: UsePUGridLayer) {
  const include = useMemo(() => {
    if (type === 'protected-areas' || type === 'features') return 'protection';
    if (type === 'analysis' && subtype === 'analysis-gap-analysis') return 'features';
    if (type === 'analysis' && subtype === 'analysis-cost-surface') return 'cost';
    if (type === 'analysis' && subtype === 'analysis-adjust-planning-units') return 'lock-status';
    if (type === 'solutions') return 'results';

    return 'protection';
  }, [type, subtype]);

  return useMemo(() => {
    if (!active || !sid) return null;

    const {
      wdpaThreshold = 0,
      puIncludedValue,
      puExcludedValue,
    } = options;

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
            paint: {
              'fill-color': '#000',
              'fill-opacity': 0,
            },
          },
          {
            type: 'line',
            'source-layer': 'layer0',
            paint: {
              'line-color': COLORS.primary,
              'line-opacity': 1,
              'line-width': 1,
              'line-offset': 0.5,
            },
          },

          // PROTECTED AREAS
          ...(type === 'protected-areas' && subtype === 'protected-areas-percentage') || type === 'features' ? [
            {
              type: 'fill',
              'source-layer': 'layer0',
              paint: {
                'fill-color': '#00F',
                'fill-opacity': [
                  'case',
                  ['all',
                    ['has', 'percentageProtected'],
                    ['>=', ['get', 'percentageProtected'], (wdpaThreshold * 100)],
                  ],
                  0.5,
                  0,
                ],
              },
            },
          ] : [],

          // ANALYSIS - GAP ANALYSIS
          ...type === 'analysis' && subtype === 'analysis-gap-analysis' ? [
            {
              type: 'fill',
              'source-layer': 'layer0',
              paint: {
                'fill-color': '#6F53F7',
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
          ...type === 'analysis' && subtype === 'analysis-cost-surface' ? [
            {
              type: 'fill',
              'source-layer': 'layer0',
              paint: {
                'fill-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'costValue'],
                  0,
                  '#FFBFB7',
                  1,
                  '#C21701',
                ],
                'fill-opacity': 0.75,
              },
            },
          ] : [],

          // ANALYSIS - ADJUST PLANNING UNITS
          ...type === 'analysis' && subtype === 'analysis-adjust-planning-units' && !!puIncludedValue ? [
            {
              type: 'line',
              'source-layer': 'layer0',
              filter: [
                'all',
                ['in', ['get', 'scenarioPuId'], ['literal', puIncludedValue]],
              ],
              paint: {
                'line-color': '#0F0',
                'line-opacity': 1,
                'line-width': 1.5,
                'line-offset': 0.75,
              },
            },
          ] : [],
          ...type === 'analysis' && subtype === 'analysis-adjust-planning-units' && !!puExcludedValue ? [
            {
              type: 'line',
              'source-layer': 'layer0',
              filter: [
                'all',
                ['in', ['get', 'scenarioPuId'], ['literal', puExcludedValue]],
              ],
              paint: {
                'line-color': '#F00',
                'line-opacity': 1,
                'line-width': 1.5,
                'line-offset': 0.75,
              },
            },
          ] : [],

          // SOLUTIONS - FREQUENCY
          ...type === 'solutions' ? [
            {
              type: 'fill',
              'source-layer': 'layer0',
              paint: {
                'fill-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'frequencyValue'],
                  0,
                  '#0C2C32',
                  33.33,
                  '#006D83',
                  66.66,
                  '#008B8C',
                  100,
                  '#0BC6C2',
                ],
                'fill-opacity': 0.75,
              },
            },
            {
              type: 'fill',
              'source-layer': 'layer0',
              filter: [
                'all',
                ['in', '-2-', ['get', 'valuePosition']],
              ],
              paint: {
                'fill-color': COLORS.primary,
                'fill-opacity': 0.75,
              },
            },
          ] : [],

        ],
      },
    };
  }, [cache, active, sid, type, subtype, options, include]);
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
        ...wdpaIucnCategories.length ? ['wdpa-percentage'] : [],
        'features',
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
    return layers
      .map((l) => {
        const L = LEGEND_LAYERS[l];
        if (L) return L(options);
        return null;
      })
      .filter((l) => !!l);
  }, [layers, options]);
}
