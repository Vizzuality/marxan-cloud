export interface TargetSPFItemProps {
  className?: string;
  isAllTargets: boolean;
  id: string;
  defaultTarget?: number;
  defaultFPF?: number;
  target?: number;
  fpf?: number;
  surface?: string;
  name?: string;
  editable?: boolean;
  isShown?: boolean;
  onChangeTarget?: (value) => void;
  onChangeFPF?: (value) => void;
  onRemove?: (value) => void;
  onSeeOnMap?: () => void;
}
