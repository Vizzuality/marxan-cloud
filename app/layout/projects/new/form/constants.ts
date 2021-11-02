import { PlanningUnit } from 'types/project-model';

export const DEFAULT_AREA = {
  planningUnitAreakm2: 10,
  planningUnitGridShape: PlanningUnit.HEXAGON,
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
];
