export enum Type {
  BIOREGIONAL = 'bioregional',
  SPECIES = 'species',
  BIOREGIONAL_AND_SPECIES = 'bioregional-and-species',
}

export interface ShowTargetSPFItemProps {
  className?: string;
  isAllTargets?: boolean;
  id?: string;
  target?: number;
  fpf?: number;
  type?: Type;
  name?: string;
  firstFeature?: boolean;
}
