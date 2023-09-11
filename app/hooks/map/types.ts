import { PUAction } from 'store/slices/scenarios/types';

import { TargetSPFItemProps } from 'components/features/target-spf-item/types';
import { Feature } from 'types/api/feature';
import { Scenario } from 'types/api/scenario';

export interface UseGeoJSONLayer {
  cache?: number;
  id: string;
  active?: boolean;
  data: Record<string, unknown>;
  options?: Record<string, unknown>;
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

export interface UsePlanningAreaPreviewLayer {
  cache?: number;
  active?: boolean;
  planningAreaId: string;
}

export interface UseGridPreviewLayer {
  cache?: number;
  active?: boolean;
  gridId: string;
}

export interface UseProyectPlanningAreaLayer {
  cache?: number;
  active?: boolean;
  pId: string;
}

export interface UseProyectGridLayer {
  cache?: number;
  active?: boolean;
  pId: string;
}

export interface UsePUGridPreviewLayer {
  cache?: number;
  active?: boolean;
  bbox?: number[] | unknown;
  planningUnitGridShape?: string;
  planningUnitAreakm2?: number;
  options?: {
    settings?: {
      opacity?: number;
      visibility?: boolean;
    };
  };
}

export interface UseWDPAPreviewLayer {
  pid: string;
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

export interface PreviewFeature extends Feature {
  splitSelected?: string;
  splitFeaturesSelected?: string[];
}

export interface UseFeaturePreviewLayers {
  cache?: number;
  active?: boolean;
  bbox?: number[] | unknown;
  features?: PreviewFeature[];
  options?: {
    featuresRecipe?: Record<string, any>[];
    featureHoverId?: string;
    selectedFeatures?: Array<string>;
    layerSettings?: Record<string, { opacity?: number; visibility?: boolean }>;
  };
}
export interface UseTargetedPreviewLayers {
  cache?: number;
  active?: boolean;
  bbox?: number[] | unknown;
  features?: TargetSPFItemProps[];
  options?: {
    featuresRecipe?: Record<string, any>[];
    featureHoverId?: string;
    selectedFeatures?: Array<string>;
    opacity?: number;
    visibility?: boolean;
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
    puAction?: PUAction;
    puIncludedValue?: string[];
    puExcludedValue?: string[];
    puAvailableValue?: string[];
    runId?: number;
    features?: string[];
    preHighlightFeatures?: Array<string>;
    postHighlightFeatures?: Array<string>;
    cost?: {
      min: number;
      max: number;
    };
    settings?: {
      pugrid?: {
        opacity?: number;
        visibility?: boolean;
      };
      'wdpa-percentage'?: {
        opacity?: number;
        visibility?: boolean;
      };
      features?: {
        opacity?: number;
        visibility?: boolean;
      };
      'features-highlight'?: {
        opacity?: number;
        visibility?: boolean;
      };
      cost?: {
        opacity?: number;
        visibility?: boolean;
      };
      'lock-in'?: {
        opacity?: number;
        visibility?: boolean;
      };
      'lock-out'?: {
        opacity?: number;
        visibility?: boolean;
      };
      'lock-available'?: {
        opacity?: number;
        visibility?: boolean;
      };
      frequency?: {
        opacity?: number;
        visibility?: boolean;
      };
      solution?: {
        opacity?: number;
        visibility?: boolean;
      };
    };
  };
}

export interface UsePUCompareLayer {
  cache?: number;
  active?: boolean;
  sid: Scenario['id'];
  sid2: Scenario['id'];
  options?: Record<string, unknown>;
}

export interface UseScenarioBLMLayer {
  cache?: number;
  active?: boolean;
  sId: string;
  blm: number;
}

export interface UseLegend {
  layers: string[];
  options?: {
    wdpaIucnCategories?: string[];
    wdpaThreshold?: number;
    cost?: {
      name: string;
      min: number;
      max: number;
    };
    items?: {
      name: string;
      id: string;
    }[];
    puAction?: PUAction;
    puIncludedValue?: string[];
    puExcludedValue?: string[];
    puAvailableValue?: string[];
    runId?: number;
    numberOfRuns?: number;
    layerSettings?: Record<string, Record<string, unknown>>;
  };
}

export interface UseBbox {
  bbox: number[];
}
