import { useMemo } from 'react';

import chroma from 'chroma-js';
import cx from 'classnames';

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
  id, active, data, options,
}: UseGeoJSONLayer) {
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
  pid, active, bbox, wdpaIucnCategories, cache = 0, options,
}: UseWDPAPreviewLayer) {
  const { opacity = 1, visibility = true } = options || {};

  return useMemo(() => {
    if (!active || !bbox) return null;

    return {
      id: `wdpa-preview-layer-${cache}`,
      type: 'vector',
      opacity,
      source: {
        type: 'vector',
        tiles: [`${process.env.NEXT_PUBLIC_API_URL}/api/v1/protected-areas/${pid}/preview/tiles/{z}/{x}/{y}.mvt?bbox=[${bbox}]`],
      },
      render: {
        layers: [
          {
            type: 'fill',
            'source-layer': 'layer0',
            layout: {
              visibility: visibility ? 'visible' : 'none',
            },
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
            layout: {
              visibility: visibility ? 'visible' : 'none',
            },
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
  }, [pid, active, bbox, wdpaIucnCategories, cache, opacity, visibility]);
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
  active, bbox, planningUnitGridShape, planningUnitAreakm2, cache, options = {},
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
        tiles: [`${process.env.NEXT_PUBLIC_API_URL}/api/v1/planning-units/preview/regular/${planningUnitGridShape}/${planningUnitAreakm2}/tiles/{z}/{x}/{y}.mvt?bbox=[${bbox}]`],
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
          ...sublayers.includes('wdpa-percentage') && wdpaThreshold !== null
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
              // ...runId && {
              //   filter: [
              //     'all',
              //     ['in', `-${runId}-`, ['get', 'valuePosition']],
              //   ],
              // },
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
  active, sid1, sid2, cache = 0, options,
}: UsePUCompareLayer) {
  const COLOR_NUMBER = 10;

  const COLOR_RAMP = useMemo(() => {
    if (!active) return null;

    const COLOR_ARRAY = [...Array(COLOR_NUMBER + 1).keys()];
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
      return chroma.scale(ramp).colors(COLOR_NUMBER + 1);
    });
    // Result:
    /*
      [
        [a0,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10],
        [b0,b1,b2,b3,b4,b5,b6,b7,b8,b9,b10],
        [c0,c1,c2,c3,c4,c5,c6,c7,c8,c9,c10],
        [d0,d1,d2,d3,d4,d5,d6,d7,d8,d9,d10],
      ]
    */

    // Get the opsite COLOR_NUMBER ramp of colors
    const COLOR_RAMPS_Y = COLOR_ARRAY.map((key) => {
      return chroma.scale([].concat(...COLOR_RAMPS_X.map((c) => c.filter((c2, j) => {
        return j === key;
      })))).colors(COLOR_NUMBER + 1);
    });
    // Result:
    /*
      [
        [a0,a0.2,a0.3,b0,b0.2,b0.3,c0,c0.2,c0.3,c0.4,d0],
        [a1,a1.2,a1.3,b1,b1.2,b1.3,c1,c1.2,c1.3,c1.4,d1],
        [a2,a2.2,a2.3,b2,b2.2,b2.3,c2,c2.2,c2.3,c2.4,d2],
        [a3,a3.2,a3.3,b3,b3.2,b3.3,c3,c3.2,c3.3,c3.4,d3],
        [a4,a4.2,a4.3,b4,b4.2,b4.3,c4,c4.2,c4.3,c4.4,d4],
        [a5,a5.2,a5.3,b5,b5.2,b5.3,c5,c5.2,c5.3,c5.4,d5],
        [a6,a6.2,a6.3,b6,b6.2,b6.3,c6,c6.2,c6.3,c6.4,d6],
        [a7,a7.2,a7.3,b7,b7.2,b7.3,c7,c7.2,c7.3,c7.4,d7],
        [a8,a8.2,a8.3,b8,b8.2,b8.3,c8,c8.2,c8.3,c8.4,d8],
        [a9,a9.2,a9.3,b9,b9.2,b9.3,c9,c9.2,c9.3,c9.4,d9],
        [a10,a10.2,a10.3,b10,b10.2,b10.3,c10,c10.2,c10.3,c10.4,d10],
      ]
    */

    const COLOR_RAMPS = [].concat(...COLOR_ARRAY.map((key) => {
      return [].concat(...COLOR_RAMPS_Y.map((c) => c.filter((c2, j) => {
        return j === key;
      })));
    }));
    // Result:
    /*
      [
        a0,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,
        a0.2,a1.2,a2.2,a3.2,a4.2,a5.2,a6.2,a7.2,a8.2,a9.2,a10.2,
        a0.3,a1.3,a2.3,a3.3,a4.3,a5.3,a6.3,a7.3,a8.3,a9.3,a10.3,
        b0,b1,b2,b3,b4,b5,b6,b7,b8,b9,b10,
        b0.2,b1.2,b2.2,b3.2,b4.2,b5.2,b6.2,b7.2,b8.2,b9.2,b10.2,
        b0.3,b1.3,b2.3,b3.3,b4.3,b5.3,b6.3,b7.3,b8.3,b9.3,b10.3,
        c0,c1,c2,c3,c4,c5,c6,c7,c8,c9,c10,
        c0.2,c1.2,c2.2,c3.2,c4.2,c5.2,c6.2,c7.2,c8.2,c9.2,c10.2,
        c0.3,c1.3,c2.3,c3.3,c4.3,c5.3,c6.3,c7.3,c8.3,c9.3,c10.3,
        c0.4,c1.4,c2.4,c3.4,c4.4,c5.4,c6.4,c7.4,c8.4,c9.4,c10.4,
        d0,d1,d2,d3,d4,d5,d6,d7,d8,d9,d10,
      ]
    */

    const RESULT = [].concat(
      ...COLOR_RAMPS.map((c, i) => {
        const step = `${Math.floor((i / (COLOR_NUMBER + 1)) % (COLOR_NUMBER + 1))}${i % (COLOR_NUMBER + 1)}`;
        const color = cx({
          '#000000': step === '00',
          '#FFFFFF': step === '1010',
          [c]: step !== '00' && step !== '1010',
        });

        return [
          step, color,
        ];
      }),
    );
    /*
      [
        '00',a0,'01',a1,'02',a2,'03',a3,'04',a4,
        '05',a5,'06',a6,'07',a7,'08',a8,'09',a9,'010',a10,
        '10',a0.2,'11',a1.2,'12',a2.2,'13',a3.2,'14',a4.2,
        '15',a5.2,'16',a6.2,'17',a7.2,'18',a8.2,'19',a9.2,'110',a10.2,
        '20',a0.3,'21',a1.3,'22',a2.3,'23',a3.3,'24',a4.3,
        '25',a5.3,'26',a6.3,'27',a7.3,'28',a8.3,'29',a9.3,'210',a10.3,
        '30',b0,'31',b1,'32',b2,'33',b3,'34',b4,
        '35',b5,'36',b6,'37',b7,'38',b8,'39',b9,'310',b10,
        '40',b0.2,'41',b1.2,'42',b2.2,'43',b3.2,'44',b4.2,
        '45',b5.2,'46',b6.2,'47',b7.2,'48',b8.2,'49',b9.2,'410',b10.2,
        '50',b0.3,'51',b1.3,'52',b2.3,'53',b3.3,'54',b4.3,
        '55',b5.3,'56',b6.3,'57',b7.3,'58',b8.3,'59',b9.3,'510',b10.3,
        '60',c0,'61',c1,'62',c2,'63',c3,'64',c4,
        '65',c5,'66',c6,'67',c7,'68',c8,'69',c9,'610',c10,
        '70',c0.2,'71',c1.2,'72',c2.2,'73',c3.2,'74',c4.2,
        '75',c5.2,'76',c6.2,'77',c7.2,'78',c8.2,'79',c9.2,'710',c10.2,
        '80',c0.3,'81',c1.3,'82',c2.3,'83',c3.3,'84',c4.3,
        '85',c5.3,'86',c6.3,'87',c7.3,'88',c8.3,'89',c9.3,'810',c10.3,
        '90',c0.4,'91',c1.4,'92',c2.4,'93',c3.4,'94',c4.4,
        '95',c5.4,'96',c6.4,'97',c7.4,'98',c8.4,'99',c9.4,'910',c10.4,
        '100',d0,'101',d1,'102',d2,'103',d3,'104',d4,
        '105',d5,'106',d6,'107',d7,'108',d8,'109',d9,'1010',d10,
      ]
    */
    return RESULT;
  }, [active]);

  return useMemo(() => {
    if (!active) return null;

    const { opacity = 1, visibility = true } = options || {};

    return {
      id: `pu-grid-layer-${sid1}-${sid2}-${cache}`,
      type: 'vector',
      opacity,
      visibility,
      source: {
        type: 'vector',
        // Use correct tiles using sid1 and sid2 in the correct endpoint: ask BE
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
  }, [active, sid1, sid2, cache, options, COLOR_RAMP]);
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
