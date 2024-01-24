import { PlanningUnit } from 'types/api/project';

export interface PlanningUnitGridProps {
  unit: PlanningUnit;
  onChange?: (value: PlanningUnit) => void;
}
