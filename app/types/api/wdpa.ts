import { Job } from './job';

export interface WDPA {
  id: string;
  type: 'protected_areas';
  countryId: string;
  designation?: string;
  name: string;
  iucnCategory: string;
  scenarioUsageCount: number;
  shapeLength?: number;
  shapeArea?: number;
  status?: Job['status'];
  wdpaId: string;
  isCustom?: boolean;
}

export interface WDPACategory {
  id: string;
  kind: 'global' | 'project';
  name: string;
  selected: boolean;
}
