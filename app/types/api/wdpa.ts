import { Job } from './job';

export interface WDPAAttributes {
  countryId: string;
  designation?: string;
  fullName: string;
  iucnCategory: string;
  scenarioUsageCount: number;
  shapeLength?: number;
  shapeArea?: number;
  status?: Job['status'];
  wdpaId: string;
}

export interface WDPA {
  id: string;
  type: string;
  attributes: WDPAAttributes;
}

export interface WDPACategory {
  id: string;
  kind: 'global' | 'project';
  name: string;
  selected: boolean;
}
