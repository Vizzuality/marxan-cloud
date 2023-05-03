import { TableRow } from 'components/table/types';
import { Solution } from 'types/project-model';

export interface SolutionRow extends TableRow, Solution {
  'view-on-map': boolean;
  best: boolean;
}

export interface SolutionsTableProps {
  bestSolutionId: string;
  body: SolutionRow[];
  selectedSolution: string;
  onSelectSolution: (s: Solution) => void;
}
