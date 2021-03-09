import { PlanningUnit } from 'types/project-model';

export interface PlanningUnitButtonProps {
  unit: PlanningUnit;
  selected: boolean;
  size: PlanningUnitButtonSizeProps;
  onClick?: (unit: PlanningUnit) => void;
}

export enum PlanningUnitButtonSizeProps {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
}
