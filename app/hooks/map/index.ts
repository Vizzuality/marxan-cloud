import { useMemo } from 'react';
import { UseAdminPreviewLayer, UsePUGridPreviewLayer } from './types';

// AdminPreview
export function useAdminPreviewLayer({
  bbox, country, region, subregion,
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
      id: 'admin-preview-layer',
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [`/api/v1/administrative-areas/${level}/preview/tiles/{z}/{x}/{y}.mvt?bbox=${bbox}&guid=${guid}`],
      },
      render: {
        layers: [
          {
            type: 'line',
            paint: {
              'line-color': '#000',
            },
          },
        ],
      },
    };
  }, [bbox, level, guid]);
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
        tiles: [`/api/v1/planning-units/preview/regular/${planningUnitGridShape}/${planningUnitAreakm2}/tiles/{z}/{x}/{y}.mvt?bbox=${bbox}`],
      },
      render: {
        layers: [
          {
            type: 'line',
            paint: {
              'line-color': '#000',
            },
          },
        ],
      },
    };
  }, [bbox, planningUnitGridShape, planningUnitAreakm2]);
}
