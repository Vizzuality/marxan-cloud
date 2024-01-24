import { PlanningArea } from 'types/api/project';

export const DEFAULT_AREA: Omit<PlanningArea, 'country'> = {
  planningUnitAreakm2: 10,
  planningUnitGridShape: 'hexagon',
};

export const PA_OPTIONS = [
  {
    label: 'Yes, I have a planning unit shapefile',
    value: 'customPAshapefileGrid',
  },
  {
    label: 'Yes, I have a planning region shapefile but no planning unit grid',
    value: 'customPAshapefile',
  },
  {
    label: 'No, I don’t have a planning region or planning unit shapefile',
    value: 'regular',
  },
] as const;
