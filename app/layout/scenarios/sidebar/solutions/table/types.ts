import { Solution } from 'types/project-model';

import { TableRow } from 'components/table/types';

export interface SolutionRow extends TableRow, Solution {
  'view-on-map': boolean;
  best: boolean;
}

export interface SolutionsTableProps {
  bestSolutionId: string,
  body: SolutionRow[];
  onSelectSolution: (s: Solution) => void;
}
