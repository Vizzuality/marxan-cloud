import { Session } from 'next-auth';

import { CostSurface } from 'types/api/cost-surface';
import { Project } from 'types/api/project';

import PROJECTS from 'services/projects';

export function bulkDeleteCostSurfaceFromProject(
  pid: Project['id'],
  csids: CostSurface['id'][],
  session: Session
) {
  const deleteCostSurfaceFromProject = ({
    pid,
    csid,
  }: {
    pid: Project['id'];
    csid: CostSurface['id'];
  }) => {
    return PROJECTS.delete(`/${pid}/cost-surface/${csid}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
  };

  return Promise.all(csids.map((csid) => deleteCostSurfaceFromProject({ pid, csid })));
}
