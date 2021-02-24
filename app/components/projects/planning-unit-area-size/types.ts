import { PlanningAreaSize, PlanningUnitAreaSizeUnit } from 'types/project-model';

export interface PlanningUnitAreaSizeProps {
  size: number;
  unit: PlanningUnitAreaSizeUnit;
  onChange?: (value: PlanningAreaSize) => void;
}
