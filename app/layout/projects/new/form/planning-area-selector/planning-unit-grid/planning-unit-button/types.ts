import { PlanningUnit } from 'types/api/project';

export type PlanningUnitButtonSizeProps = 'sm' | 'md' | 'lg';

export interface PlanningUnitButtonProps {
  unit: PlanningUnit;
  selected: boolean;
  size: PlanningUnitButtonSizeProps;
  onClick?: (unit: PlanningUnit) => void;
}
