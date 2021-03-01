export enum Type {
  BIOREGIONAL = 'bioregional',
  SPECIES = 'species',
  BIOREGIONAL_AND_SPECIES = 'bioregional-and-species',
}

export interface TargetSPF {
  isAllTargets: boolean;
  id: string;
  target: number;
  spf: number;
  type?: Type;
  surface?: string;
  name?: string;
}

export interface TargetSPFItemProps {
  targetSPF: TargetSPF;
  className?: string;
  onChange?: (value: TargetSPF) => void;
  onRemove?: (value: TargetSPF) => void
}
