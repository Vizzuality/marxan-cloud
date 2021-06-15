export interface ScenariosSidebarSolutionsSectionsProps {
  onChangeSection: (s: string) => void;
}

export enum SolutionsSections {
  SOLUTIONS = 'solutions',
  GAP_ANALYSIS = 'gap-analysis',
}
