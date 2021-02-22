import { PlanningUnit } from 'types/project-model';

export interface PlanningUnitButtonProps {
  unit: PlanningUnit;
  selected: boolean;
  size: ButtonSize;
  onClick?: (unit: PlanningUnit) => void;
}

export enum ButtonSize {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
}
