import { useMemo } from 'react';
import {
  UseAdminPreviewLayer, UsePUGridLayer, UsePUGridPreviewLayer, UseWDPAPreviewLayer,
} from './types';

// AdminPreview
export function useAdminPreviewLayer({
  active, country, region, subregion,
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
      id: `admin-preview-layer-${guid}`,
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
  }, [active, level, guid]);
}

// PUGridpreview
export function useWDPAPreviewLayer({
  active, bbox, wdpaIucnCategories,
}: UseWDPAPreviewLayer) {
  return useMemo(() => {
    if (!active || !bbox) return null;

    return {
      id: 'wdpa-preview-layer',
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
              'fill-color': '#00BFFF',
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
  }, [active, bbox, wdpaIucnCategories]);
}

// PUGridpreview
export function usePUGridPreviewLayer({
  active, bbox, planningUnitGridShape, planningUnitAreakm2,
}: UsePUGridPreviewLayer) {
  return useMemo(() => {
    if (!active || !bbox || !planningUnitGridShape || !planningUnitAreakm2) return null;

    return {
      id: 'pu-grid-preview-layer',
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
              'line-color': '#00BFFF',
              'line-opacity': 0.5,
            },
          },
        ],
      },
    };
  }, [active, bbox, planningUnitGridShape, planningUnitAreakm2]);
}

// PUGridpreview
export function usePUGridLayer({
  active, sid, type, options = {},
}: UsePUGridLayer) {
  return useMemo(() => {
    if (!active || !sid) return null;

    const { clickingValue } = options;

    const LOCKIN_STATUS = [
      { id: 0, color: '#FF0' },
      { id: 1, color: '#F0F' },
      { id: 2, color: '#0FF' },
      { id: 3, color: '#0F0' },
      { id: 4, color: '#F00' },
      { id: 5, color: '#00F' },
    ];

    return {
      id: 'pu-grid-layer',
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scenarios/${sid}/planning-units/tiles/{z}/{x}/{y}.mvt`],
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
              'line-color': '#00BFFF',
              'line-opacity': 1,
            },
          },
          ...type === 'adjust-planning-units' ? LOCKIN_STATUS.map((s, i) => (
            {
              type: 'line',
              'source-layer': 'layer0',
              filter: [
                'all',
                ['==', ['get', 'lockinstatus'], s.id],
              ],
              paint: {
                'line-color': s.color,
                'line-opacity': 1,
              },
              layout: {
                'line-sort-key': i * 10,
              },
            }
          )) : [],
          ...type === 'adjust-planning-units' ? [
            {
              type: 'line',
              'source-layer': 'layer0',
              filter: [
                'all',
                ['in', ['get', 'pugeomid'], ['literal', clickingValue]],
              ],
              paint: {
                'line-color': '#F00',
                'line-opacity': 1,
                'line-width': 2,
              },
              layout: {
                'line-sort-key': 100,
              },
            },
          ] : [],
        ],
      },
    };
  }, [active, sid, type, options]);
}
