import { Job } from './job';

export interface WDPA {
  id: string;
  wdpaId: string;
  fullName: string;
  iucnCategory: string;
  countryId: string;
  shapeLength?: number;
  shapeArea?: number;
  status?: Job['status'];
  designation?: string;
  scenarioUsageCount: number;
}

export interface WDPACategory {
  id: string;
  kind: 'global' | 'project';
  name: string;
  selected: boolean;
}
