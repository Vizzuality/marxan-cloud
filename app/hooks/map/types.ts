import { ScenarioSidebarSubTabs, ScenarioSidebarTabs } from 'layout/scenarios/show/sidebar/types';

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
  };
}

export interface UsePUGridLayer {
  cache?: number;
  sid?: string;
  active?: boolean;
  type: ScenarioSidebarTabs;
  runId?: number;
  subtype: ScenarioSidebarSubTabs;
  options?: {
    wdpaIucnCategories?: string[];
    wdpaThreshold?: number;
    puAction?: string;
    puIncludedValue?: string[];
    puExcludedValue?: string[];
    runId?: string;
    settings?: {
      pugrid?: {
        opacity?: number;
      },
      'wdpa-percentage'?: {
        opacity?: number;
      },
      cost?: {
        opacity?: number;
      },
      'lock-in'?: {
        opacity?: number;
      },
      'lock-out'?: {
        opacity?: number;
      },
      frequency?: {
        opacity?: number;
      },
      solution?: {
        opacity?: number;
      },
    };
  };
}

export interface UseLegend {
  type: ScenarioSidebarTabs;
  subtype: ScenarioSidebarSubTabs;
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
