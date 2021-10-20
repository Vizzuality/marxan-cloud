import { PlanningUnit } from 'types/project-model';

export const DEFAULT_AREA = {
  planningUnitAreakm2: 10,
  planningUnitGridShape: PlanningUnit.HEXAGON,
};

export const PA_OPTIONS = [
  {
    label: 'Yes, I have a shapefile with a planning region and a grid',
    value: 'customPAshapefileGrid',
  },
  {
    label: 'Yes, I have a shapefile with a planning region without grid ',
    value: 'customPAshapefile',
  },
  {
    label: 'No, I don’t have any shapefiles',
    value: 'regular',
  },
];
