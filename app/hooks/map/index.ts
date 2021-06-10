import { useMemo } from 'react';
import { UseAdminPreviewLayer, UsePUGridPreviewLayer, UseWDPAPreviewLayer } from './types';

// AdminPreview
export function useAdminPreviewLayer({
  country, region, subregion,
}: UseAdminPreviewLayer) {
  const level = useMemo(() => {
    if (subregion) return 2;
    if (region) return 1;
    if (country) return 0;

    return null;
  }, [country, region, subregion]);

  const guid = subregion || region || country;

  return useMemo(() => {
    if (typeof level === 'undefined' || !guid) return null;

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
  }, [level, guid]);
}

// PUGridpreview
export function usePUGridPreviewLayer({
  bbox, planningUnitGridShape, planningUnitAreakm2,
}: UsePUGridPreviewLayer) {
  return useMemo(() => {
    if (!bbox || !planningUnitGridShape || !planningUnitAreakm2) return null;

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
              'line-color': '#000',
            },
          },
        ],
      },
    };
  }, [bbox, planningUnitGridShape, planningUnitAreakm2]);
}

// PUGridpreview
export function useWDPAPreviewLayer({
  bbox, wdpaIucnCategories,
}: UseWDPAPreviewLayer) {
  return useMemo(() => {
    if (!bbox) return null;

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
  }, [bbox, wdpaIucnCategories]);
}
