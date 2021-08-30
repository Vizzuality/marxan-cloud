import { ItemProps as SelectedItemProps } from 'components/features/selected-item/component';

export interface UseGeoJSONLayer {
  cache?: number;
  id: string;
  active?: boolean;
  data: Record<string, unknown>;
}
export interface UseAdminPreviewLayer {
  cache?: number;
  active?: boolean;
  bbox?: number[];
  country?: string;
  region?: string;
  subregion?: string;
  search?: string;
}

export interface UsePUGridPreviewLayer {
  cache?: number;
  active?: boolean;
  bbox?: number[] | unknown;
  planningUnitGridShape?: string;
  planningUnitAreakm2?: number;
}

export interface UseWDPAPreviewLayer {
  cache?: number;
  active?: boolean;
  bbox?: number[] | unknown;
  wdpaIucnCategories?: string[];
  options?: Record<string, unknown>;
}

export interface UseFeaturePreviewLayer {
  cache?: number;
  active?: boolean;
  bbox?: number[] | unknown;
  id?: string;
}

export interface UseFeaturePreviewLayers {
  cache?: number;
  active?: boolean;
  bbox?: number[] | unknown;
  features?: SelectedItemProps[];
  options?: {
    featureHoverId?: string;
    settings?: {
      bioregional?: {
        opacity?: number;
        visibility?: boolean;
      },
      species?: {
        opacity?: number;
        visibility?: boolean;
      },
      features?: {
        opacity?: number;
        visibility?: boolean;
      }
    }
  };
}

export interface UsePUGridLayer {
  cache?: number;
  sid?: string;
  active?: boolean;
  runId?: number;
  include?: string;
  sublayers: string[];
  options?: {
    wdpaIucnCategories?: string[];
    wdpaThreshold?: number;
    puAction?: string;
    puIncludedValue?: string[];
    puExcludedValue?: string[];
    runId?: string;
    features?: string[];
    highlightFeatures?: Array<string>;
    settings?: {
      pugrid?: {
        opacity?: number;
        visibility?: boolean;
      },
      'wdpa-percentage'?: {
        opacity?: number;
        visibility?: boolean;
      },
      features?: {
        opacity?: number;
        visibility?: boolean;
      },
      cost?: {
        opacity?: number;
        visibility?: boolean;
      },
      'lock-in'?: {
        opacity?: number;
        visibility?: boolean;
      },
      'lock-out'?: {
        opacity?: number;
        visibility?: boolean;
      },
      frequency?: {
        opacity?: number;
        visibility?: boolean;
      },
      solution?: {
        opacity?: number;
        visibility?: boolean;
      },
    };
  };
}

export interface UseLegend {
  layers: string[];
  options?: {
    wdpaIucnCategories?: string[];
    wdpaThreshold?: number;
    puAction?: string;
    puIncludedValue?: string[];
    puExcludedValue?: string[];
    runId?: string;
    layerSettings?: Record<string, unknown>;
  };
}
