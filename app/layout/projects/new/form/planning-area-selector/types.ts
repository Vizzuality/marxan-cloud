import { PlanningArea } from 'types/project-model';

export interface PlanningAreaSelectorProps {
  area: any;
  values: any;
  onChange?: (area: PlanningArea) => void;
}
