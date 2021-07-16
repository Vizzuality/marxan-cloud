import { PlanningUnit } from 'types/project-model';

export interface PlanningUnitGridProps {
  unit: PlanningUnit;
  onChange?: (value: PlanningUnit) => void;
}
