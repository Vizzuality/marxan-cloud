import { TableRow } from 'components/table/types';
import { Solution } from 'types/project-model';

export interface SolutionRow extends TableRow, Solution {}

export interface SolutionsTableProps {
  body: SolutionRow[];
}
