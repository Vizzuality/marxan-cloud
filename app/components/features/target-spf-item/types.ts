export enum Type {
  BIOREGIONAL = 'bioregional',
  SPECIES = 'species',
  BIOREGIONAL_AND_SPECIES = 'bioregional-and-species',
}
export interface TargetSPFItemProps {
  className?: string;
  isAllTargets: boolean;
  id: string;
  defaultTarget?: number;
  defaultFPF?: number;
  target?: number;
  fpf?: number;
  type?: Type;
  surface?: string;
  name?: string;
  editable?: boolean;
  onChangeTarget?: (value) => void;
  onChangeFPF?: (value) => void;
  onRemove?: (value) => void
}
