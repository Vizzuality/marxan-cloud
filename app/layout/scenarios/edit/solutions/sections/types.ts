export interface ScenariosSidebarSolutionsSectionsProps {
  onChangeSection: (s: string) => void;
}

export enum SolutionsSections {
  DETAILS = 'details',
  GAP_ANALYSIS = 'gap-analysis',
  SOLUTIONS = 'solutions',
}
