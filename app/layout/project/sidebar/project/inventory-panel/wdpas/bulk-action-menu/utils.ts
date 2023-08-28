import { Session } from 'next-auth';

import { Project } from 'types/api/project';
import { WDPA } from 'types/api/wdpa';

import PROJECTS from 'services/projects';

export function bulkDeleteWDPAFromProject(
  pid: Project['id'],
  wdpaids: WDPA['id'][],
  session: Session
) {
  const deleteFeatureFromProject = ({
    pid,
    wdpaid,
  }: {
    pid: Project['id'];
    wdpaid: WDPA['id'];
  }) => {
    return PROJECTS.delete(`/${pid}/protected-areas/${wdpaid}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
  };

  return Promise.all(wdpaids.map((wdpaid) => deleteFeatureFromProject({ pid, wdpaid })));
}
