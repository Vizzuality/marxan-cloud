// usePublishedProjects
export interface UseAdminPublishedProjectsProps {
  page: number;
  search?: string;
  sort?: Record<string, string>;
  filters?: Record<string, unknown>
}
