import { TableRow } from 'components/table/types';
import { Solution } from 'types/project-model';

export interface SolutionRow extends TableRow, Solution {
  'view-on-map': boolean;
  best: boolean;
}

export interface SolutionsTableProps {
  body: SolutionRow[];
  onSelectSolution: (s: Solution) => void;
}
