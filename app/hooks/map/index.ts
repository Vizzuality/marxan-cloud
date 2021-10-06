import { useMemo } from 'react';

import chroma from 'chroma-js';

import { COLORS, LEGEND_LAYERS } from './constants';
import {
  UseAdminPreviewLayer,
  UseFeaturePreviewLayer,
  UseFeaturePreviewLayers,
  UseGeoJSONLayer,
  UseLegend,
  UsePUCompareLayer,
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
    const { featuresRecipe = [], featureHoverId, settings = {} } = options;

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

        const F = featuresRecipe.find((fr) => fr.id === id) || f;

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
                ...F.splitSelected && {
                  filter: [
                    'all',
                    ['in', ['get', F.splitSelected], ['literal', F.splitFeaturesSelected.map((s) => s.id)]],
                  ],
                },
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
                ...F.splitSelected && {
                  filter: [
                    'all',
                    ['in', ['get', F.splitSelected], ['literal', F.splitFeaturesSelected.map((s) => s.id)]],
                  ],
                },
                layout: {
                  visibility: getLayerVisibility(type),
                },
                paint: {
                  'line-color': '#000',
                  'line-opacity': getLayerOpacity(),
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
      cost = {
        min: 0,
        max: 1,
      },
      puIncludedValue,
      puExcludedValue,
      features = [],
      highlightFeatures = [],
      runId,
      settings = {},
    } = options;

    const {
      pugrid: PUgridSettings = {},
      'wdpa-percentage': WdpaPercentageSettings = {},
      features: PreGapAnalysisSettings = {},
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
      opacity: WdpaPercentageOpacity = 1,
      visibility: WdpaPercentageVisibility = true,
    } = WdpaPercentageSettings;
    const {
      opacity: PreGapAnalysisOpacity = 1,
      visibility: PreGapAnalysisVisibility = true,
    } = PreGapAnalysisSettings;
    const {
      opacity: CostOpacity = 1,
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
      opacity: FrequencyOpacity = 1,
      visibility: FrequencyVisibility = true,
    } = FrequencySettings;
    const {
      opacity: SolutionOpacity = 1,
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
              layout: {
                visibility: getLayerVisibility(PreGapAnalysisVisibility),
              },
              paint: {
                'fill-color': COLORS.features,
                'fill-opacity': [
                  'case',
                  ['any',
                    ...(features.map((id) => {
                      return ['in', id, ['get', 'featureList']];
                    })),
                  ],
                  0.5 * PreGapAnalysisOpacity,
                  0,
                ],
              },
            },
            {
              type: 'fill',
              'source-layer': 'layer0',
              layout: {
                visibility: getLayerVisibility(PreGapAnalysisVisibility),
              },
              paint: {
                'fill-color': COLORS.highlightFeatures,
                'fill-opacity': [
                  'case',
                  ['any',
                    ...(highlightFeatures.map((id) => {
                      return ['in', id, ['get', 'featureList']];
                    })),
                  ],
                  0.5 * PreGapAnalysisOpacity,
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
                  cost.min === cost.max ? 0 : cost.min,
                  COLORS.cost[0],
                  cost.max,
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

export function usePUCompareLayer({
  active, sid1, sid2, cache = 0,
}: UsePUCompareLayer) {
  const COLOR_NUMBER = 10;

  const COLOR_RAMP = useMemo(() => {
    if (!active) return null;

    const COLOR_ARRAY = [...Array(COLOR_NUMBER).keys()];
    /*
      COLORS.compare:
      [
        [a1,a2,a3,a4],
        [b1,b2,b3,b4],
        [c1,c2,c3,c4],
        [d1,d2,d3,d4],
      ]
    */

    const COLOR_RAMPS_X = COLORS.compare.map((ramp) => {
      return chroma.scale(ramp).colors(COLOR_NUMBER);
    });
    // Result:
    /*
      [
        [a1,a2,a3,a4,a5,a6,a7,a8,a9,a10],
        [b1,b2,b3,b4,b5,b6,b7,b8,b9,b10],
        [c1,c2,c3,c4,c5,c6,c7,c8,c9,c10],
        [d1,d2,d3,d4,d5,d6,d7,d8,d9,d10],
      ]
    */

    // Get the opsite COLOR_NUMBER ramp of colors
    const COLOR_RAMPS_Y = COLOR_ARRAY.map((key) => {
      return chroma.scale([].concat(...COLOR_RAMPS_X.map((c) => c.filter((cx, j) => {
        return j === key;
      })))).colors(COLOR_NUMBER);
    });
    // Result:
    /*
      [
        [a1,a1.2,a1.3,b1,b1.2,b1.3,c1,c1.2,c1.3,d1],
        [a2,a2.2,a2.3,b2,b2.2,b2.3,c2,c2.2,c2.3,d2],
        [a3,a3.2,a3.3,b3,b3.2,b3.3,c3,c3.2,c3.3,d3],
        [a4,a4.2,a4.3,b4,b4.2,b4.3,c4,c4.2,c4.3,d4],
        [a5,a5.2,a5.3,b5,b5.2,b5.3,c5,c5.2,c5.3,d5],
        [a6,a6.2,a6.3,b6,b6.2,b6.3,c6,c6.2,c6.3,d6],
        [a7,a7.2,a7.3,b7,b7.2,b7.3,c7,c7.2,c7.3,d7],
        [a8,a8.2,a8.3,b8,b8.2,b8.3,c8,c8.2,c8.3,d8],
        [a9,a9.2,a9.3,b9,b9.2,b9.3,c9,c9.2,c9.3,d9],
        [a10,a10.2,a10.3,b10,b10.2,b10.3,c10,c10.2,c10.3,d10],
      ]
    */

    const COLOR_RAMPS = [].concat(...COLOR_ARRAY.map((key) => {
      return [].concat(...COLOR_RAMPS_Y.map((c) => c.filter((cx, j) => {
        return j === key;
      })));
    }));
    // Result:
    /*
      [
        [a1,a2,a3,a4,a5,a6,a7,a8,a9,a10],
        [a1.2,a2.2,a3.2,a4.2,a5.2,a6.2,a7.2,a8.2,a9.2,a10.2],
        [a1.3,a2.3,a3.3,a4.3,a5.3,a6.3,a7.3,a8.3,a9.3,a10.3],
        [b1,b2,b3,b4,b5,b6,b7,b8,b9,b10],
        [b1.2,b2.2,b3.2,b4.2,b5.2,b6.2,b7.2,b8.2,b9.2,b10.2],
        [b1.3,b2.3,b3.3,b4.3,b5.3,b6.3,b7.3,b8.3,b9.3,b10.3],
        [c1,c2,c3,c4,c5,c6,c7,c8,c9,c10],
        [c1.2,c2.2,c3.2,c4.2,c5.2,c6.2,c7.2,c8.2,c9.2,c10.2],
        [c1.3,c2.3,c3.3,c4.3,c5.3,c6.3,c7.3,c8.3,c9.3,c10.3],
        [d1,d2,d3,d4,d5,d6,d7,d8,d9,d10],
      ]
    */

    const RESULT = [].concat(
      ...COLOR_RAMPS.map((c, i) => {
        return [
          `${Math.floor((i / COLOR_NUMBER) % COLOR_NUMBER)}${i % COLOR_NUMBER}`, c,
        ];
      }),
    );
    /*
      [
        '00',a1,'01',a2,'02',a3,'03',a4,'04',a5,'05',a6,'06',a7,'07',a8,'08',a9,'09',a10,
        '10',a1.2,'11',a2.2,'12',a3.2,'13',a4.2,'14',a5.2,...
        '20',a1.3,'21',a2.3,'22',a3.3,'23',a4.3,'24',a5.3,...
        '30',b1,'31',b2,'32',b3,'33',b4,'34',b5,...
        '40',b1.2,'41',b2.2,'42',b3.2,'43',b4.2,'44',b5.2,...
        '50',b1.3,'51',b2.3,'52',b3.3,'53',b4.3,'54',b5.3,...
        '60',c1,'61',c2,'62',c3,'63',c4,'64',c5,...
        '70',c1.2,'71',c2.2,'72',c3.2,'73',c4.2,'74',c5.2,...
        '80',c1.3,'71',c2.3,'72',c3.3,'73',c4.3,'74',c5.3,...
        '90',d1,'71',d2,'72',d3,'73',d4,'74',d5,...
      ]
    */

    return RESULT;
  }, [active]);

  return useMemo(() => {
    if (!active) return null;

    return {
      id: `pu-grid-layer-${sid1}-${sid2}-${cache}`,
      type: 'vector',
      source: {
        type: 'vector',
        // Use correct tiles whenever the API return the compare endpoint
        tiles: [`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scenarios/${sid1}/planning-units/tiles/{z}/{x}/{y}.mvt?include=results`],
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
                  ['round', ['/', ['get', 'frequencyValue'], 100 / COLOR_NUMBER]],
                  ['round', ['/', ['get', 'frequencyValue'], 100 / COLOR_NUMBER]],
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
  }, [active, sid1, sid2, cache, COLOR_RAMP]);
}

// PUGrid
export function useLegend({
  layers, options = {},
}: UseLegend) {
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
